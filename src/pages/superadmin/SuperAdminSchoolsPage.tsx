import { School, Plus, Edit2, Power, Search, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { supabase } from '../../shared/lib/supabase';

interface SchoolRecord {
  id: string;
  name: string;
  address: string | null;
  subscription_tier: string;
  is_active: boolean;
  created_at: string;
}

const TIERS = ['free', 'basic', 'premium', 'enterprise'] as const;
const tierLabel: Record<string, string> = {
  free: 'Miễn phí',
  basic: 'Cơ bản',
  premium: 'Cao cấp',
  enterprise: 'Doanh nghiệp',
};
const tierColor: Record<string, string> = {
  free: 'bg-cream text-charcoal/60',
  basic: 'bg-blue-100 text-blue-700',
  premium: 'bg-gold/20 text-gold',
  enterprise: 'bg-primary/10 text-primary',
};

interface FormState {
  name: string;
  address: string;
  subscription_tier: string;
}

function SuperAdminSchoolsContent() {
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<SchoolRecord | null>(null);
  const [form, setForm] = useState<FormState>({ name: '', address: '', subscription_tier: 'basic' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('schools')
      .select('id, name, address, subscription_tier, is_active, created_at')
      .order('created_at', { ascending: false });
    setSchools(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ name: '', address: '', subscription_tier: 'basic' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (school: SchoolRecord) => {
    setEditTarget(school);
    setForm({ name: school.name, address: school.address ?? '', subscription_tier: school.subscription_tier });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Tên cơ sở không được để trống'); return; }
    setSaving(true);
    setError('');
    if (editTarget) {
      const { error: err } = await supabase
        .from('schools')
        .update({ name: form.name.trim(), address: form.address.trim() || null, subscription_tier: form.subscription_tier })
        .eq('id', editTarget.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase
        .from('schools')
        .insert({ name: form.name.trim(), address: form.address.trim() || null, subscription_tier: form.subscription_tier, is_active: true });
      if (err) { setError(err.message); setSaving(false); return; }
    }
    setSaving(false);
    setShowModal(false);
    load();
  };

  const toggleActive = async (school: SchoolRecord) => {
    await supabase.from('schools').update({ is_active: !school.is_active }).eq('id', school.id);
    load();
  };

  const filtered = schools.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.address ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy font-display">Quản Lý Cơ Sở</h1>
          <p className="text-charcoal/60 font-body text-sm mt-1">Toàn bộ trung tâm trong hệ thống</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-5 py-2.5 font-body font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm cơ sở
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, địa chỉ..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm pl-9 pr-4 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        />
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gold/20 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <School className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
            <p className="text-charcoal/50 font-body">Không tìm thấy cơ sở nào</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-cream border-b border-gold/20">
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Tên cơ sở</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide hidden md:table-cell">Địa chỉ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Gói</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide hidden lg:table-cell">Ngày tạo</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {filtered.map(school => (
                <tr key={school.id} className="hover:bg-cream/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-navy font-body">{school.name}</p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-charcoal/60 font-body">{school.address ?? '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium font-body ${tierColor[school.subscription_tier] ?? 'bg-cream text-charcoal/60'}`}>
                      {tierLabel[school.subscription_tier] ?? school.subscription_tier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium font-body ${
                      school.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {school.is_active ? 'Hoạt động' : 'Tạm ngừng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <p className="text-sm text-charcoal/60 font-body">
                      {new Date(school.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(school)}
                        className="p-1.5 hover:bg-primary/10 rounded-lg text-charcoal/60 hover:text-primary transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(school)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          school.is_active
                            ? 'hover:bg-red-100 text-charcoal/60 hover:text-red-600'
                            : 'hover:bg-green-100 text-charcoal/60 hover:text-green-600'
                        }`}
                        title={school.is_active ? 'Tạm ngừng' : 'Kích hoạt'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-elegant w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gold/20">
              <h2 className="text-lg font-semibold text-navy font-display">
                {editTarget ? 'Chỉnh sửa cơ sở' : 'Thêm cơ sở mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-cream rounded-lg text-charcoal/60 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 font-body">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-navy font-body mb-1.5">Tên cơ sở *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="VD: Trung tâm Âm nhạc YayaMusic Hà Nội"
                  className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy font-body mb-1.5">Địa chỉ</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="VD: 123 Phố Huế, Hoàn Kiếm, Hà Nội"
                  className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy font-body mb-1.5">Gói đăng ký</label>
                <select
                  value={form.subscription_tier}
                  onChange={e => setForm(f => ({ ...f, subscription_tier: e.target.value }))}
                  className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
                  {TIERS.map(t => (
                    <option key={t} value={t}>{tierLabel[t]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gold/20">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-body text-charcoal/60 hover:text-charcoal transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-5 py-2 font-body font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {editTarget ? 'Lưu thay đổi' : 'Thêm cơ sở'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SuperAdminSchoolsPage() {
  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <SuperAdminSchoolsContent />
    </RoleGuard>
  );
}
