import { Clock, Plus, Trash2, X, Edit2, Sun, Sunset, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { supabase } from '../../shared/lib/supabase';
import { useUser } from '../../domains/auth/contexts/UserContext';

interface ScheduleSlot {
  id: string;
  label: string;
  period: 'morning' | 'afternoon' | 'evening';
  start_time: string;
  end_time: string;
  sort_order: number;
  is_active: boolean;
}

const PERIOD_CONFIG = {
  morning:   { label: 'Buổi sáng',  color: 'bg-amber-50 border-amber-200',   badge: 'bg-amber-100 text-amber-700',   icon: Sun    },
  afternoon: { label: 'Buổi chiều', color: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-700', icon: Sunset },
  evening:   { label: 'Buổi tối',   color: 'bg-indigo-50 border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', icon: Moon   },
};

const BLANK = {
  label: '',
  period: 'morning' as const,
  start_time: '',
  end_time: '',
  sort_order: 0,
};

function AdminScheduleSlotsContent() {
  const { profile } = useUser();
  const schoolId = profile?.school_id ?? '';
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ScheduleSlot | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    if (!schoolId) return;
    setLoading(true);
    const { data } = await supabase
      .from('schedule_slots')
      .select('*')
      .eq('school_id', schoolId)
      .order('period')
      .order('sort_order')
      .order('start_time');
    setSlots((data ?? []) as ScheduleSlot[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [schoolId]);

  const openCreate = () => {
    setEditing(null);
    setForm(BLANK);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (slot: ScheduleSlot) => {
    setEditing(slot);
    setForm({
      label: slot.label,
      period: slot.period,
      start_time: slot.start_time.slice(0, 5),
      end_time: slot.end_time.slice(0, 5),
      sort_order: slot.sort_order,
    });
    setFormError('');
    setShowForm(true);
  };

  const save = async () => {
    if (!form.label.trim()) { setFormError('Vui lòng nhập tên khung giờ'); return; }
    if (!form.start_time) { setFormError('Vui lòng chọn giờ bắt đầu'); return; }
    if (!form.end_time) { setFormError('Vui lòng chọn giờ kết thúc'); return; }
    if (form.start_time >= form.end_time) { setFormError('Giờ kết thúc phải sau giờ bắt đầu'); return; }

    setSaving(true); setFormError('');
    const payload = {
      school_id: schoolId,
      label: form.label.trim(),
      period: form.period,
      start_time: form.start_time,
      end_time: form.end_time,
      sort_order: form.sort_order,
    };

    if (editing) {
      const { error } = await supabase.from('schedule_slots').update(payload).eq('id', editing.id);
      if (error) { setFormError(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('schedule_slots').insert(payload);
      if (error) { setFormError(error.message); setSaving(false); return; }
    }

    setSaving(false);
    setShowForm(false);
    load();
  };

  const toggleActive = async (slot: ScheduleSlot) => {
    await supabase.from('schedule_slots').update({ is_active: !slot.is_active }).eq('id', slot.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Xoá khung giờ này? Các lớp đang dùng slot này sẽ không bị ảnh hưởng nhưng slot sẽ không còn trong danh sách chọn.')) return;
    await supabase.from('schedule_slots').delete().eq('id', id);
    load();
  };

  // Group by period
  const grouped = (['morning', 'afternoon', 'evening'] as const).map(p => ({
    period: p,
    ...PERIOD_CONFIG[p],
    slots: slots.filter(s => s.period === p),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy font-display">Cài Đặt Khung Giờ</h1>
          <p className="text-charcoal/60 font-body text-sm mt-1">
            Cấu hình các khung giờ học — sáng / chiều / tối. Dùng khi tạo lớp.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm khung giờ
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-cream border border-gold/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy font-body">
              {editing ? 'Sửa khung giờ' : 'Thêm khung giờ mới'}
            </p>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-cream-dark rounded-lg text-charcoal/60">
              <X className="w-4 h-4" />
            </button>
          </div>
          {formError && <p className="text-sm text-red-600 font-body">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-navy font-body mb-1">Tên khung giờ *</label>
              <input
                type="text"
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="VD: Sáng 1, Chiều 2, Tối 1..."
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Buổi *</label>
              <select
                value={form.period}
                onChange={e => setForm(f => ({ ...f, period: e.target.value as typeof form.period }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              >
                <option value="morning">🌅 Buổi sáng</option>
                <option value="afternoon">☀️ Buổi chiều</option>
                <option value="evening">🌙 Buổi tối</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Thứ tự hiển thị</label>
              <input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Giờ bắt đầu *</label>
              <input
                type="time"
                value={form.start_time}
                onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Giờ kết thúc *</label>
              <input
                type="time"
                value={form.end_time}
                onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-body text-charcoal/60 hover:text-charcoal">Huỷ</button>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Clock className="w-4 h-4" />}
              {editing ? 'Lưu thay đổi' : 'Thêm khung giờ'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ period, label, color, badge, slots: periodSlots, icon: Icon }) => (
            <div key={period}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-charcoal/50" />
                <h2 className="text-sm font-semibold text-navy font-body">{label}</h2>
                <span className="text-xs text-charcoal/40 font-body">({periodSlots.length} khung giờ)</span>
              </div>
              {periodSlots.length === 0 ? (
                <div className={`border-2 border-dashed rounded-xl p-6 text-center ${color}`}>
                  <p className="text-sm text-charcoal/50 font-body">Chưa có khung giờ {label.toLowerCase()} — nhấn "Thêm khung giờ" để tạo</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {periodSlots.map(slot => (
                    <div
                      key={slot.id}
                      className={`bg-white rounded-xl border shadow-card p-4 ${!slot.is_active ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-navy font-body">{slot.label}</p>
                          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium font-body ${badge}`}>
                            {PERIOD_CONFIG[slot.period].label}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(slot)} className="p-1.5 hover:bg-cream rounded-lg text-charcoal/40 hover:text-navy transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => remove(slot.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-charcoal/40 hover:text-red-600 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-body text-charcoal/70">
                        <Clock className="w-4 h-4 text-charcoal/40" />
                        {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gold/10">
                        <span className="text-xs text-charcoal/40 font-body">Thứ tự: {slot.sort_order}</span>
                        <button
                          onClick={() => toggleActive(slot)}
                          className={`text-xs px-2 py-0.5 rounded font-body font-medium transition-colors ${slot.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                        >
                          {slot.is_active ? 'Đang dùng' : 'Tắt'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {slots.length === 0 && (
            <div className="bg-white rounded-xl border border-gold/20 shadow-card p-12 text-center">
              <Clock className="w-12 h-12 text-gold/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-navy font-display mb-2">Chưa có khung giờ nào</h3>
              <p className="text-charcoal/60 font-body text-sm mb-6">
                Tạo các khung giờ học cho trung tâm để sử dụng khi lập lịch lớp học
              </p>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-5 py-2.5 font-body font-semibold text-sm"
              >
                <Plus className="w-4 h-4" /> Thêm khung giờ đầu tiên
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminScheduleSlotsPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'super_admin']}>
      <AdminScheduleSlotsContent />
    </RoleGuard>
  );
}
