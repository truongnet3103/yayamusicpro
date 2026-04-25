import { Users, Search, School, Plus, X, Check, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { supabase } from '../../shared/lib/supabase';

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  user_type: string;
  school_id: string | null;
  created_at: string;
  schools: { name: string } | null;
}

const roleLabel: Record<string, string> = {
  super_admin: 'Quản trị hệ thống',
  it_admin: 'IT Admin',
  admin: 'Quản trị viên',
  staff: 'Nhân viên',
  teacher: 'Giảng viên',
  parent: 'Phụ huynh',
  student: 'Học viên',
};

const roleColor: Record<string, string> = {
  super_admin: 'bg-primary/10 text-primary',
  it_admin: 'bg-navy/10 text-navy',
  admin: 'bg-gold/20 text-gold',
  staff: 'bg-blue-100 text-blue-700',
  teacher: 'bg-purple-100 text-purple-700',
  parent: 'bg-green-100 text-green-700',
  student: 'bg-cream text-charcoal/60',
};

type UserType = 'super_admin' | 'it_admin' | 'admin' | 'staff' | 'teacher' | 'parent' | 'student';

const BLANK_FORM = {
  first_name: '', last_name: '', email: '', password: '',
  user_type: 'teacher' as UserType, school_id: '',
};

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

function SuperAdminUsersContent() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [usersRes, schoolsRes] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('id, full_name, email, user_type, school_id, created_at, schools(name)')
        .order('created_at', { ascending: false })
        .limit(200),
      supabase.from('schools').select('id, name').order('name'),
    ]);
    setUsers((usersRes.data as UserRow[]) ?? []);
    setSchools(schoolsRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) { setFormError('Vui lòng nhập họ và tên'); return; }
    if (!form.email.trim()) { setFormError('Vui lòng nhập email'); return; }
    if (form.password.length < 6) { setFormError('Mật khẩu phải từ 6 ký tự trở lên'); return; }
    const needsSchool = !['super_admin', 'it_admin'].includes(form.user_type);
    if (needsSchool && !form.school_id) { setFormError('Vui lòng chọn cơ sở cho vai trò này'); return; }
    setSaving(true); setFormError('');
    try {
      const { id: uid } = await callAdminEdge('POST', {
        email: form.email.trim(),
        password: form.password,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        user_type: form.user_type,
        school_id: form.school_id || null,
      });

      // Domain record (teachers/parents/students) is now created by the edge function
      // using service role key — no RLS issues.

      setSaving(false); setShowForm(false); setForm(BLANK_FORM);
      load();
    } catch (e: any) {
      setFormError(e.message ?? 'Lỗi khi tạo tài khoản');
      setSaving(false);
    }
  };

  const handleDelete = async (user: UserRow) => {
    if (!window.confirm(`Xoá người dùng ${user.full_name ?? user.email}?\nHành động này không thể hoàn tác.`)) return;
    setDeletingId(user.id);
    try {
      await callAdminEdge('DELETE', { user_id: user.id });
      load();
    } catch (e: any) {
      alert(e.message ?? 'Lỗi khi xoá');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch =
      !search ||
      (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? '').toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.user_type === filterRole;
    const matchSchool = !filterSchool || u.school_id === filterSchool;
    return matchSearch && matchRole && matchSchool;
  });

  const needsSchool = !['super_admin', 'it_admin'].includes(form.user_type);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy font-display">Tất Cả Người Dùng</h1>
          <p className="text-charcoal/60 font-body text-sm mt-1">Danh sách người dùng toàn hệ thống</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError(''); setForm(BLANK_FORM); }}
          className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm người dùng
        </button>
      </div>

      {showForm && (
        <div className="bg-cream border border-gold/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy font-body">Tạo tài khoản mới</p>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-cream-dark rounded-lg text-charcoal/60"><X className="w-4 h-4" /></button>
          </div>
          {formError && <p className="text-sm text-red-600 font-body">{formError}</p>}
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
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@email.com"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Mật khẩu * (≥6 ký tự)</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Vai trò *</label>
              <select value={form.user_type} onChange={e => setForm(f => ({ ...f, user_type: e.target.value as UserType, school_id: '' }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                {Object.entries(roleLabel).map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">
                Cơ sở {needsSchool ? '*' : '(không cần thiết)'}
              </label>
              <select value={form.school_id} onChange={e => setForm(f => ({ ...f, school_id: e.target.value }))}
                disabled={!needsSchool}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white disabled:opacity-40">
                <option value="">— Chọn cơ sở —</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-body text-charcoal/60 hover:text-charcoal transition-colors">Huỷ</button>
            <button onClick={handleCreate} disabled={saving}
              className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors disabled:opacity-50">
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Check className="w-4 h-4" />}
              Tạo tài khoản
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
          <input
            type="text"
            placeholder="Tên hoặc email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white w-56"
          />
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        >
          <option value="">Tất cả vai trò</option>
          {Object.entries(roleLabel).map(([val, lbl]) => (
            <option key={val} value={val}>{lbl}</option>
          ))}
        </select>
        <select
          value={filterSchool}
          onChange={e => setFilterSchool(e.target.value)}
          className="px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        >
          <option value="">Tất cả cơ sở</option>
          {schools.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gold/20 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
            <p className="text-charcoal/50 font-body">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-cream border-b border-gold/20">
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Họ tên</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide hidden md:table-cell">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide hidden lg:table-cell">Cơ sở</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide hidden lg:table-cell">Ngày tạo</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-cream/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary font-body">
                          {(user.full_name ?? 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-navy font-body">{user.full_name ?? '—'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-charcoal/60 font-body">{user.email ?? '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium font-body ${roleColor[user.user_type] ?? 'bg-cream text-charcoal/60'}`}>
                      {roleLabel[user.user_type] ?? user.user_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-charcoal/30" />
                      <p className="text-sm text-charcoal/60 font-body">
                        {user.schools?.name ?? '—'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <p className="text-sm text-charcoal/60 font-body">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={deletingId === user.id}
                      className="p-1.5 text-charcoal/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xoá người dùng"
                    >
                      {deletingId === user.id
                        ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gold/10 bg-cream/30">
            <p className="text-xs text-charcoal/50 font-body">Hiển thị {filtered.length} / {users.length} người dùng</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SuperAdminUsersPage() {
  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <SuperAdminUsersContent />
    </RoleGuard>
  );
}
