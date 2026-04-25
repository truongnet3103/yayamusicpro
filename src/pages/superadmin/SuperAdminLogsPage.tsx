import { Activity, Search, Check, X, School, Plus, CalendarPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { supabase } from '../../shared/lib/supabase';

interface SessionLog {
  id: string;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  status: 'scheduled' | 'claimed' | 'verified' | 'cancelled';
  claimed_at: string | null;
  claim_notes: string | null;
  verified_at: string | null;
  classes: { name: string } | null;
  teachers: { first_name: string; last_name: string } | null;
  schools: { name: string } | null;
}

interface ClassOption {
  id: string;
  name: string;
  school_id: string;
  teacher_id: string | null;
  start_time: string | null;
  end_time: string | null;
  teachers: { id: string; first_name: string; last_name: string } | null;
  schools: { name: string } | null;
}

const BLANK_SESSION = {
  class_id: '',
  session_date: new Date().toISOString().slice(0, 10),
  start_time: '',
  end_time: '',
};

const statusLabel: Record<string, string> = {
  scheduled: 'Đã lên lịch',
  claimed: 'Đã xác nhận dạy',
  verified: 'Đã kiểm duyệt',
  cancelled: 'Đã huỷ',
};

const statusColor: Record<string, string> = {
  scheduled: 'bg-gold/20 text-gold',
  claimed: 'bg-blue-100 text-blue-700',
  verified: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

function SuperAdminLogsContent() {
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [verifying, setVerifying] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_SESSION);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true);
    const [sessionsRes, schoolsRes, classesRes] = await Promise.all([
      supabase
        .from('class_sessions')
        .select(`
          id, session_date, start_time, end_time, status, claimed_at, claim_notes, verified_at,
          classes(name),
          teachers(first_name, last_name),
          schools(name)
        `)
        .order('session_date', { ascending: false })
        .limit(200),
      supabase.from('schools').select('id, name').order('name'),
      supabase
        .from('classes')
        .select('id, name, school_id, teacher_id, start_time, end_time, teachers(id, first_name, last_name), schools(name)')
        .eq('status', 'active')
        .order('name'),
    ]);
    setSessions((sessionsRes.data as SessionLog[]) ?? []);
    setSchools(schoolsRes.data ?? []);
    setClasses((classesRes.data as ClassOption[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const verify = async (id: string) => {
    setVerifying(id);
    await supabase
      .from('class_sessions')
      .update({ status: 'verified', verified_at: new Date().toISOString() })
      .eq('id', id);
    setVerifying(null);
    load();
  };

  const reject = async (id: string) => {
    await supabase
      .from('class_sessions')
      .update({ status: 'cancelled' })
      .eq('id', id);
    load();
  };

  const selectedClass = classes.find(c => c.id === form.class_id);

  const createSession = async () => {
    if (!form.class_id) { setFormError('Vui lòng chọn lớp học'); return; }
    if (!form.session_date) { setFormError('Vui lòng chọn ngày'); return; }
    if (!selectedClass?.teacher_id) { setFormError('Lớp này chưa có giáo viên được phân công'); return; }
    setSaving(true); setFormError('');
    const { error } = await supabase.from('class_sessions').insert({
      class_id: form.class_id,
      school_id: selectedClass.school_id,
      teacher_id: selectedClass.teacher_id,
      session_date: form.session_date,
      start_time: form.start_time || selectedClass.start_time || null,
      end_time: form.end_time || selectedClass.end_time || null,
      status: 'scheduled',
    });
    setSaving(false);
    if (error) { setFormError(error.message); return; }
    setShowForm(false); setForm(BLANK_SESSION);
    load();
  };

  const filtered = sessions.filter(s => {
    const teacherName = `${s.teachers?.first_name ?? ''} ${s.teachers?.last_name ?? ''}`.trim();
    const matchSearch =
      !search ||
      (s.classes?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      teacherName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || s.status === filterStatus;
    const matchSchool = !filterSchool || s.schools?.name === filterSchool;
    return matchSearch && matchStatus && matchSchool;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy font-display">Nhật Ký Buổi Dạy</h1>
          <p className="text-charcoal/60 font-body text-sm mt-1">Theo dõi và xác nhận buổi dạy toàn hệ thống</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError(''); setForm(BLANK_SESSION); }}
          className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors"
        >
          <CalendarPlus className="w-4 h-4" /> Tạo buổi dạy
        </button>
      </div>

      {showForm && (
        <div className="bg-cream border border-gold/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy font-body">Tạo buổi dạy mới</p>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-cream-dark rounded-lg text-charcoal/60"><X className="w-4 h-4" /></button>
          </div>
          {formError && <p className="text-sm text-red-600 font-body">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-navy font-body mb-1">Lớp học *</label>
              <select value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                <option value="">— Chọn lớp —</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.schools?.name ? `(${c.schools.name})` : ''} — GV: {c.teachers ? `${c.teachers.first_name} ${c.teachers.last_name}` : 'Chưa có'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Ngày dạy *</label>
              <input type="date" value={form.session_date} onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-navy font-body mb-1">Giờ bắt đầu</label>
                <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                  placeholder={selectedClass?.start_time?.slice(0, 5) ?? ''}
                  className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy font-body mb-1">Giờ kết thúc</label>
                <input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                  placeholder={selectedClass?.end_time?.slice(0, 5) ?? ''}
                  className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
              </div>
            </div>
          </div>
          {selectedClass && (
            <p className="text-xs text-charcoal/50 font-body">
              Cơ sở: {selectedClass.schools?.name ?? '—'} · Giáo viên: {selectedClass.teachers ? `${selectedClass.teachers.first_name} ${selectedClass.teachers.last_name}` : 'Chưa phân công'}
              {selectedClass.start_time && ` · Giờ lớp: ${selectedClass.start_time.slice(0,5)}–${selectedClass.end_time?.slice(0,5) ?? '?'}`}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-body text-charcoal/60 hover:text-charcoal transition-colors">Huỷ</button>
            <button onClick={createSession} disabled={saving}
              className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors disabled:opacity-50">
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Plus className="w-4 h-4" />}
              Tạo buổi dạy
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
          <input
            type="text"
            placeholder="Lớp hoặc giáo viên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white w-52"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(statusLabel).map(([val, lbl]) => (
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
            <option key={s.id} value={s.name}>{s.name}</option>
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
            <Activity className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
            <p className="text-charcoal/50 font-body">Không có buổi dạy nào</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-cream border-b border-gold/20">
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Lớp học</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide hidden md:table-cell">Giáo viên</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide hidden lg:table-cell">Cơ sở</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide hidden lg:table-cell">Ghi chú</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {filtered.map(session => (
                <tr key={session.id} className="hover:bg-cream/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-navy font-body">
                      {new Date(session.session_date).toLocaleDateString('vi-VN')}
                    </p>
                    {session.start_time && (
                      <p className="text-xs text-charcoal/50 font-body">
                        {session.start_time.slice(0, 5)}
                        {session.end_time ? ` – ${session.end_time.slice(0, 5)}` : ''}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-navy font-body">{session.classes?.name ?? '—'}</p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-charcoal/70 font-body">
                      {session.teachers ? `${session.teachers.first_name} ${session.teachers.last_name}` : '—'}
                    </p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-charcoal/30" />
                      <p className="text-sm text-charcoal/60 font-body">{session.schools?.name ?? '—'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium font-body ${statusColor[session.status]}`}>
                      {statusLabel[session.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <p className="text-xs text-charcoal/50 font-body max-w-[160px] truncate">
                      {session.claim_notes ?? '—'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {session.status === 'claimed' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => verify(session.id)}
                          disabled={verifying === session.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-medium font-body transition-colors disabled:opacity-50"
                          title="Xác nhận đã kiểm duyệt"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Duyệt
                        </button>
                        <button
                          onClick={() => reject(session.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs font-medium font-body transition-colors"
                          title="Từ chối"
                        >
                          <X className="w-3.5 h-3.5" />
                          Từ chối
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gold/10 bg-cream/30">
            <p className="text-xs text-charcoal/50 font-body">Hiển thị {filtered.length} / {sessions.length} buổi dạy</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SuperAdminLogsPage() {
  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <SuperAdminLogsContent />
    </RoleGuard>
  );
}
