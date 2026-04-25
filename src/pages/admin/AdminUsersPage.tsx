import { Users, BookOpen, GraduationCap, User, Plus, Search, X, Check, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { useTenant } from '../../shared/contexts/TenantContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { supabase } from '../../shared/lib/supabase';

async function callAdminEdge(method: 'POST' | 'DELETE', body: object): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token ?? ''}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Lỗi máy chủ');
  return json;
}

type TabType = 'teachers' | 'parents' | 'students';

/* ─── Teachers Tab ─── */
interface Teacher {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  subject_specialization: string | null;
}

function TeachersTab({ schoolId }: { schoolId: string }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', phone: '', subject_specialization: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('teachers')
      .select('id, user_id, first_name, last_name, email, phone, subject_specialization')
      .eq('school_id', schoolId)
      .order('last_name');
    setTeachers(data ?? []);
    setLoading(false);
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) { setError('Vui lòng nhập họ và tên'); return; }
    if (!form.email.trim()) { setError('Vui lòng nhập email để tạo tài khoản'); return; }
    if (form.password.length < 6) { setError('Mật khẩu phải từ 6 ký tự trở lên'); return; }
    setSaving(true); setError('');
    try {
      const { id: _uid } = await callAdminEdge('POST', {
        email: form.email.trim(),
        password: form.password,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        user_type: 'teacher',
        school_id: schoolId,
        phone: form.phone.trim() || null,
        specialization: form.subject_specialization.trim() || null,
      });
      // Domain record created by edge function (service role) — no RLS issue
      setSaving(false); setShowForm(false);
      setForm({ first_name: '', last_name: '', email: '', password: '', phone: '', subject_specialization: '' });
      load();
    } catch (e: any) {
      setError(e.message ?? 'Lỗi khi tạo tài khoản');
      setSaving(false);
    }
  };

  const handleDelete = async (teacher: Teacher) => {
    if (!window.confirm(`Xoá giảng viên ${teacher.last_name} ${teacher.first_name}?\nHành động này không thể hoàn tác.`)) return;
    setDeletingId(teacher.id);
    try {
      if (teacher.user_id) {
        // Cascade delete: auth user → user_profiles → teachers (all via FK ON DELETE CASCADE)
        await callAdminEdge('DELETE', { user_id: teacher.user_id });
      } else {
        await supabase.from('teachers').delete().eq('id', teacher.id);
      }
      load();
    } catch (e: any) {
      alert(e.message ?? 'Lỗi khi xoá');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = teachers.filter(t =>
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (t.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
          <input type="text" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-cream w-48" />
        </div>
        <button onClick={() => { setShowForm(true); setError(''); }}
          className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors">
          <Plus className="w-4 h-4" /> Thêm giảng viên
        </button>
      </div>

      {showForm && (
        <div className="bg-cream border border-gold/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy font-body">Thêm giảng viên mới</p>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-cream-dark rounded-lg text-charcoal/60"><X className="w-4 h-4" /></button>
          </div>
          {error && <p className="text-sm text-red-600 font-body">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Họ *</label>
              <input type="text" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Nguyễn"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Tên *</label>
              <input type="text" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="Văn A"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="gv@email.com"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Mật khẩu * (≥6 ký tự)</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Số điện thoại</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0901234567"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Chuyên môn</label>
              <input type="text" value={form.subject_specialization} onChange={e => setForm(f => ({ ...f, subject_specialization: e.target.value }))} placeholder="Piano, Violin..."
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-body text-charcoal/60 hover:text-charcoal transition-colors">Huỷ</button>
            <button onClick={handleAdd} disabled={saving}
              className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors disabled:opacity-50">
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Check className="w-4 h-4" />}
              Tạo tài khoản
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary"></div></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <BookOpen className="w-10 h-10 text-charcoal/20 mx-auto mb-2" />
          <p className="text-sm text-charcoal/50 font-body">{search ? 'Không tìm thấy giảng viên' : 'Chưa có giảng viên nào'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="flex items-center gap-3 p-3 bg-cream rounded-xl border border-gold/20">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary font-body">{t.first_name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy font-body">{t.last_name} {t.first_name}</p>
                <p className="text-xs text-charcoal/50 font-body truncate">
                  {[t.subject_specialization, t.email, t.phone].filter(Boolean).join(' · ')}
                </p>
              </div>
              <button
                onClick={() => handleDelete(t)}
                disabled={deletingId === t.id}
                className="p-2 text-charcoal/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Xoá giảng viên"
              >
                {deletingId === t.id
                  ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                  : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Parents Tab ─── */
interface Parent {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
}

function ParentsTab({ schoolId }: { schoolId: string }) {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('parents')
      .select('id, user_id, first_name, last_name, email, phone')
      .eq('school_id', schoolId)
      .order('last_name');
    setParents(data ?? []);
    setLoading(false);
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) { setError('Vui lòng nhập họ và tên'); return; }
    if (!form.email.trim()) { setError('Vui lòng nhập email để tạo tài khoản đăng nhập'); return; }
    if (form.password.length < 6) { setError('Mật khẩu phải từ 6 ký tự trở lên'); return; }
    setSaving(true); setError('');
    try {
      const { id: _uid2 } = await callAdminEdge('POST', {
        email: form.email.trim(),
        password: form.password,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        user_type: 'parent',
        school_id: schoolId,
        phone: form.phone.trim() || null,
      });
      // Domain record created by edge function (service role)
      setSaving(false); setShowForm(false);
      setForm({ first_name: '', last_name: '', email: '', password: '', phone: '' });
      load();
    } catch (e: any) {
      setError(e.message ?? 'Lỗi khi tạo tài khoản');
      setSaving(false);
    }
  };

  const handleDelete = async (parent: Parent) => {
    if (!window.confirm(`Xoá phụ huynh ${parent.last_name} ${parent.first_name}?\nHành động này không thể hoàn tác.`)) return;
    setDeletingId(parent.id);
    try {
      if (parent.user_id) {
        await callAdminEdge('DELETE', { user_id: parent.user_id });
      } else {
        await supabase.from('parents').delete().eq('id', parent.id);
      }
      load();
    } catch (e: any) {
      alert(e.message ?? 'Lỗi khi xoá');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = parents.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (p.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.phone ?? '').includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
          <input type="text" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-cream w-48" />
        </div>
        <button onClick={() => { setShowForm(true); setError(''); }}
          className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors">
          <Plus className="w-4 h-4" /> Thêm phụ huynh
        </button>
      </div>

      {showForm && (
        <div className="bg-cream border border-gold/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy font-body">Thêm phụ huynh mới</p>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-cream-dark rounded-lg text-charcoal/60"><X className="w-4 h-4" /></button>
          </div>
          {error && <p className="text-sm text-red-600 font-body">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Họ *</label>
              <input type="text" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Trần"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Tên *</label>
              <input type="text" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="Thị B"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ph@email.com"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Mật khẩu * (≥6 ký tự)</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-navy font-body mb-1">Số điện thoại</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0912345678"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-body text-charcoal/60 hover:text-charcoal transition-colors">Huỷ</button>
            <button onClick={handleAdd} disabled={saving}
              className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors disabled:opacity-50">
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Check className="w-4 h-4" />}
              Tạo tài khoản
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary"></div></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <User className="w-10 h-10 text-charcoal/20 mx-auto mb-2" />
          <p className="text-sm text-charcoal/50 font-body">{search ? 'Không tìm thấy phụ huynh' : 'Chưa có phụ huynh nào'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 bg-cream rounded-xl border border-gold/20">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-green-700 font-body">{p.first_name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy font-body">{p.last_name} {p.first_name}</p>
                <p className="text-xs text-charcoal/50 font-body truncate">
                  {[p.phone, p.email].filter(Boolean).join(' · ')}
                </p>
              </div>
              <button
                onClick={() => handleDelete(p)}
                disabled={deletingId === p.id}
                className="p-2 text-charcoal/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Xoá phụ huynh"
              >
                {deletingId === p.id
                  ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                  : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Students Tab ─── */
interface Student {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
}

function StudentsTab({ schoolId }: { schoolId: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Pick<Parent, 'id' | 'first_name' | 'last_name'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', phone: '', date_of_birth: '', parent_id: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [studentsRes, parentsRes] = await Promise.all([
      supabase.from('students').select('id, user_id, first_name, last_name, email, phone, date_of_birth').eq('school_id', schoolId).order('last_name'),
      supabase.from('parents').select('id, first_name, last_name').eq('school_id', schoolId).order('last_name'),
    ]);
    setStudents(studentsRes.data ?? []);
    setParents(parentsRes.data ?? []);
    setLoading(false);
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) { setError('Vui lòng nhập họ và tên học viên'); return; }
    if (form.email.trim() && form.password.length < 6) { setError('Mật khẩu phải từ 6 ký tự trở lên'); return; }
    setSaving(true); setError('');
    try {
      // Edge function creates domain record (students + student_parents) using service role — bypasses RLS
      await callAdminEdge('POST', {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        ...(form.email.trim() && form.password ? { email: form.email.trim(), password: form.password } : {}),
        user_type: 'student',
        school_id: schoolId,
        phone: form.phone.trim() || null,
        date_of_birth: form.date_of_birth || null,
        parent_id: form.parent_id || null,
      });
      setSaving(false); setShowForm(false);
      setForm({ first_name: '', last_name: '', email: '', password: '', phone: '', date_of_birth: '', parent_id: '' });
      load();
    } catch (e: any) {
      setError(e.message ?? 'Lỗi khi tạo học viên');
      setSaving(false);
    }
  };

  const handleDelete = async (student: Student) => {
    if (!window.confirm(`Xoá học viên ${student.last_name} ${student.first_name}?\nHành động này không thể hoàn tác.`)) return;
    setDeletingId(student.id);
    try {
      if (student.user_id) {
        await callAdminEdge('DELETE', { user_id: student.user_id });
      } else {
        await supabase.from('students').delete().eq('id', student.id);
      }
      load();
    } catch (e: any) {
      alert(e.message ?? 'Lỗi khi xoá');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (s.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
          <input type="text" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-cream w-48" />
        </div>
        <button onClick={() => { setShowForm(true); setError(''); }}
          className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors">
          <Plus className="w-4 h-4" /> Thêm học viên
        </button>
      </div>

      {showForm && (
        <div className="bg-cream border border-gold/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy font-body">Thêm học viên mới</p>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-cream-dark rounded-lg text-charcoal/60"><X className="w-4 h-4" /></button>
          </div>
          {error && <p className="text-sm text-red-600 font-body">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Họ *</label>
              <input type="text" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Lê"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Tên *</label>
              <input type="text" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="Văn C"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Ngày sinh</label>
              <input type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Số điện thoại</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0901234567"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Email (để tạo tài khoản)</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="hv@email.com"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Mật khẩu (nếu có email)</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-navy font-body mb-1">Phụ huynh (tuỳ chọn)</label>
              <select value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                <option value="">— Chọn phụ huynh —</option>
                {parents.map(p => (
                  <option key={p.id} value={p.id}>{p.last_name} {p.first_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-body text-charcoal/60 hover:text-charcoal transition-colors">Huỷ</button>
            <button onClick={handleAdd} disabled={saving}
              className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors disabled:opacity-50">
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Check className="w-4 h-4" />}
              Thêm học viên
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary"></div></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <GraduationCap className="w-10 h-10 text-charcoal/20 mx-auto mb-2" />
          <p className="text-sm text-charcoal/50 font-body">{search ? 'Không tìm thấy học viên' : 'Chưa có học viên nào'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <div key={s.id} className="flex items-center gap-3 p-3 bg-cream rounded-xl border border-gold/20">
              <div className="w-9 h-9 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-navy font-body">{s.first_name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy font-body">{s.last_name} {s.first_name}</p>
                <p className="text-xs text-charcoal/50 font-body truncate">
                  {[
                    s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString('vi-VN') : null,
                    s.phone,
                    s.email,
                  ].filter(Boolean).join(' · ')}
                </p>
              </div>
              <button
                onClick={() => handleDelete(s)}
                disabled={deletingId === s.id}
                className="p-2 text-charcoal/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Xoá học viên"
              >
                {deletingId === s.id
                  ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                  : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Page ─── */
function AdminUsersPageContent() {
  const { profile } = useUser();
  const { school } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabType) || 'teachers';

  const schoolId = school?.id || profile?.school_id || null;

  const tabs = [
    { id: 'teachers' as TabType, label: 'Giảng viên', icon: BookOpen },
    { id: 'parents' as TabType, label: 'Phụ huynh', icon: User },
    { id: 'students' as TabType, label: 'Học viên', icon: GraduationCap },
  ];

  const handleTabChange = (tab: TabType) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    setSearchParams(params);
  };

  if (!schoolId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="w-16 h-16 text-gold/30 mx-auto mb-4" />
          <p className="text-charcoal/60 font-body">Không thể tải thông tin cơ sở</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy font-display">Quản Lý Tài Khoản</h1>
        <p className="text-charcoal/60 font-body text-sm mt-1">Thêm và quản lý giảng viên, phụ huynh và học viên</p>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gold/20">
        <div className="border-b border-gold/20">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors font-body ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-charcoal/60 hover:text-charcoal hover:border-gold/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'teachers' && <TeachersTab schoolId={schoolId} />}
          {activeTab === 'parents' && <ParentsTab schoolId={schoolId} />}
          {activeTab === 'students' && <StudentsTab schoolId={schoolId} />}
        </div>
      </div>
    </div>
  );
}

export function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'staff']}>
      <PermissionGuard requiredCapabilities={['admin:view']}>
        <AdminUsersPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
