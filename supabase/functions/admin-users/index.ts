import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const callerToken = req.headers.get('Authorization')?.replace('Bearer ', '') ?? '';

  // Verify caller identity using their own JWT (anon key context)
  const callerClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: `Bearer ${callerToken}` } },
  });
  const { data: { user }, error: authErr } = await callerClient.auth.getUser();
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

  // Admin client with service role key (never exposed to browser)
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Use service role to read profile — avoids RLS blocking super_admin (null school_id)
  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('user_type, school_id')
    .eq('id', user.id)
    .maybeSingle();

  const isSuperAdmin = profile?.user_type === 'super_admin';
  const isAdmin = profile?.user_type === 'admin';
  if (!isSuperAdmin && !isAdmin) return json({ error: 'Forbidden' }, 403);

  // POST /admin-users — create user
  if (req.method === 'POST') {
    const body = await req.json();
    const {
      email, password, first_name, last_name, user_type, school_id,
      phone, specialization,
      // student-only extras
      date_of_birth, parent_id,
    } = body;

    if (!first_name || !last_name || !user_type) {
      return json({ error: 'Missing required fields' }, 400);
    }

    // Students may be created without auth account (no email/password)
    const needsAuth = user_type !== 'student' || (email && password);
    if (needsAuth && (!email || !password)) {
      return json({ error: 'Missing required fields' }, 400);
    }

    // Admins (non-super) can only create teacher/parent/student for their own school
    if (isAdmin && !isSuperAdmin) {
      const allowedTypes = ['teacher', 'parent', 'student'];
      if (!allowedTypes.includes(user_type)) return json({ error: 'Forbidden: role not allowed' }, 403);
      if (school_id && school_id !== profile?.school_id) return json({ error: 'Forbidden: wrong school' }, 403);
    }

    let uid: string | null = null;

    // Only create auth user when credentials are provided
    if (email && password) {
      const { data: authData, error: authCreateErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name, last_name },
      });
      if (authCreateErr) return json({ error: authCreateErr.message }, 400);

      uid = authData.user.id;
      const { error: profErr } = await adminClient.from('user_profiles').insert({
        id: uid,
        first_name,
        last_name,
        email,
        user_type,
        school_id: school_id || null,
      });

      if (profErr) {
        await adminClient.auth.admin.deleteUser(uid);
        return json({ error: profErr.message }, 400);
      }
    }

    // Create domain record (teachers / parents / students) using service role — bypasses RLS
    if (school_id) {
      const ts = Date.now();
      if (user_type === 'teacher') {
        const { error: domErr } = await adminClient.from('teachers').insert({
          ...(uid ? { user_id: uid } : {}),
          school_id,
          employee_code: `T-${ts}`,
          first_name, last_name,
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
          ...(specialization ? { specialization } : {}),
        });
        if (domErr) {
          if (uid) await adminClient.auth.admin.deleteUser(uid);
          return json({ error: domErr.message }, 400);
        }
      } else if (user_type === 'parent') {
        const { error: domErr } = await adminClient.from('parents').insert({
          ...(uid ? { user_id: uid } : {}),
          school_id,
          first_name, last_name,
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
        });
        if (domErr) {
          if (uid) await adminClient.auth.admin.deleteUser(uid);
          return json({ error: domErr.message }, 400);
        }
      } else if (user_type === 'student') {
        const { data: studentRow, error: domErr } = await adminClient.from('students').insert({
          ...(uid ? { user_id: uid } : {}),
          school_id,
          student_code: `S-${ts}`,
          first_name, last_name,
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
          ...(date_of_birth ? { date_of_birth } : {}),
        }).select('id').single();
        if (domErr || !studentRow) {
          if (uid) await adminClient.auth.admin.deleteUser(uid);
          return json({ error: domErr?.message ?? 'Student insert failed' }, 400);
        }
        // Link student to parent if provided
        if (parent_id) {
          const { error: linkErr } = await adminClient.from('student_parents').insert({
            student_id: studentRow.id,
            parent_id,
          });
          if (linkErr) {
            // Non-fatal: student created, just log
            console.error('student_parents link failed:', linkErr.message);
          }
        }
        return json({ id: uid, student_id: studentRow.id });
      }
    }

    return json({ id: uid });
  }

  // DELETE /admin-users — delete user
  if (req.method === 'DELETE') {
    const body = await req.json();
    const { user_id } = body;
    if (!user_id) return json({ error: 'Missing user_id' }, 400);

    // Prevent self-deletion
    if (user_id === user.id) return json({ error: 'Cannot delete yourself' }, 400);

    // Admins (non-super) can only delete users from their school
    if (isAdmin && !isSuperAdmin) {
      const { data: target } = await adminClient
        .from('user_profiles')
        .select('school_id, user_type')
        .eq('id', user_id)
        .maybeSingle();
      if (!target) return json({ error: 'User not found' }, 404);
      if (target.school_id !== profile?.school_id) return json({ error: 'Forbidden: wrong school' }, 403);
      if (['super_admin', 'it_admin', 'admin'].includes(target.user_type)) {
        return json({ error: 'Forbidden: cannot delete this role' }, 403);
      }
    }

    const { error: delErr } = await adminClient.auth.admin.deleteUser(user_id);
    if (delErr) return json({ error: delErr.message }, 400);
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
});
