import { TrendingUp, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { supabase } from '../../shared/lib/supabase';

interface SchoolTier {
  id: string;
  name: string;
  subscription_tier: string;
  is_active: boolean;
}

const TIERS = ['free', 'basic', 'premium', 'enterprise'] as const;
type Tier = typeof TIERS[number];

const tierLabel: Record<Tier, string> = {
  free: 'Miễn phí',
  basic: 'Cơ bản',
  premium: 'Cao cấp',
  enterprise: 'Doanh nghiệp',
};

const tierColor: Record<Tier, string> = {
  free: 'bg-cream text-charcoal/60',
  basic: 'bg-blue-100 text-blue-700',
  premium: 'bg-gold/20 text-gold',
  enterprise: 'bg-primary/10 text-primary',
};

const tierFeatures: Record<Tier, string[]> = {
  free: ['Điểm danh cơ bản', 'Tối đa 2 lớp', 'Tối đa 20 học viên'],
  basic: ['Điểm danh + Thông báo', 'Tối đa 10 lớp', 'Tối đa 100 học viên'],
  premium: ['Tất cả tính năng', 'Không giới hạn lớp', 'Tối đa 500 học viên', 'Báo cáo nâng cao'],
  enterprise: ['Tất cả tính năng', 'Không giới hạn', 'API tích hợp', 'Hỗ trợ ưu tiên'],
};

function SuperAdminSubscriptionsContent() {
  const [schools, setSchools] = useState<SchoolTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [newTier, setNewTier] = useState<Tier>('basic');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('schools')
      .select('id, name, subscription_tier, is_active')
      .order('name');
    setSchools(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (school: SchoolTier) => {
    setEditId(school.id);
    setNewTier(school.subscription_tier as Tier);
  };

  const cancelEdit = () => setEditId(null);

  const saveTier = async (id: string) => {
    setSaving(true);
    await supabase.from('schools').update({ subscription_tier: newTier }).eq('id', id);
    setSaving(false);
    setEditId(null);
    load();
  };

  const tierCount = TIERS.reduce<Record<string, number>>((acc, t) => {
    acc[t] = schools.filter(s => s.subscription_tier === t && s.is_active).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy font-display">Quản Lý Gói Đăng Ký</h1>
        <p className="text-charcoal/60 font-body text-sm mt-1">Gói dịch vụ của từng trung tâm</p>
      </div>

      {/* Tier overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map(t => (
          <div key={t} className="bg-white rounded-xl shadow-card border border-gold/20 p-5">
            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium font-body mb-3 ${tierColor[t]}`}>
              {tierLabel[t]}
            </span>
            <p className="text-2xl font-bold text-navy font-display">{tierCount[t] ?? 0}</p>
            <p className="text-xs text-charcoal/50 font-body mt-1">cơ sở đang dùng</p>
            <ul className="mt-3 space-y-1">
              {tierFeatures[t].slice(0, 2).map((f, i) => (
                <li key={i} className="text-xs text-charcoal/60 font-body flex items-center gap-1">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* School table */}
      <div className="bg-white rounded-xl shadow-card border border-gold/20 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-cream border-b border-gold/20">
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Cơ sở</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Gói hiện tại</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Đổi gói</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {schools.map(school => (
                <tr key={school.id} className="hover:bg-cream/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-navy font-body">{school.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium font-body ${tierColor[school.subscription_tier as Tier] ?? 'bg-cream text-charcoal/60'}`}>
                      {tierLabel[school.subscription_tier as Tier] ?? school.subscription_tier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium font-body ${
                      school.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {school.is_active ? 'Hoạt động' : 'Tạm ngừng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editId === school.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={newTier}
                          onChange={e => setNewTier(e.target.value as Tier)}
                          className="px-2 py-1 border border-gold/30 rounded-lg text-sm font-body focus:outline-none bg-white"
                        >
                          {TIERS.map(t => (
                            <option key={t} value={t}>{tierLabel[t]}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => saveTier(school.id)}
                          disabled={saving}
                          className="p-1.5 bg-primary/10 hover:bg-primary/20 rounded-lg text-primary transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 hover:bg-cream rounded-lg text-charcoal/60 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(school)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium font-body text-primary hover:bg-primary/10 rounded-lg transition-colors ml-auto"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        Đổi gói
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function SuperAdminSubscriptionsPage() {
  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <SuperAdminSubscriptionsContent />
    </RoleGuard>
  );
}
