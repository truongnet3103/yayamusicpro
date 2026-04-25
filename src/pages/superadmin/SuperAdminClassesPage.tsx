import { GraduationCap, Search, Plus, X, Check, Trash2, School, BookOpen, User } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { supabase } from '../../shared/lib/supabase';

interface ClassRow {
  id: string;
  school_id: string;
  course_id: string;
  teacher_id: string | null;
  code: string;
  name: string;
  section: string | null;
  room: string | null;
  schedule: string | null;
  start_date: string | null;
  end_date: string | null;
  max_students: number | null;
  status: string;
  created_at: string;
  schools: { name: string } | null;
  courses: { name: string; code: string } | null;
  teachers: { first_name: string; last_name: string } | null;
}

const statusLabel: Record<string, string> = {
  active: 'Đang học',
  completed: 'Hoàn thành',
  cancelled: 'Đã huỷ',
};

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-600',
};

const BLANK_FORM = {
  school_id: '',
  course_id: '',
  teacher_id: '',
  code: '',
  name: '',
  section: '',
  room: '',
  schedule: '',
  start_date: '',
  end_date: '',
  max_students: '',
  status: 'active',
};

function SuperAdminClassesContent() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [coursesBySchool, setCoursesBySchool] = useState<{ id: string; name: string; school_id: string }[]>([]);
  const [teachersBySchool, setTeachersBySchool] = useState<{ id: string; first_name: string; last_name: string; school_id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [classesRes, schoolsRes, coursesRes, teachersRes] = await Promise.all([
      supabase
        .from('classes')
        .select('id, school_id, course_id, teacher_id, code, name, section, room, schedule, start_date, end_date, max_students, status, created_at, schools(name), courses(name, code), teachers(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(500),
      supabase.from('schools').select('id, name').order('name'),
      supabase.from('courses').select('id, name, school_id').eq('is_active', true).order('name'),
      supabase.from('teachers').select('id, first_name, last_name, school_id').order('last_name'),
    ]);
    setClasses((classesRes.data as ClassRow[]) ?? []);
    setSchools(schoolsRes.data ?? []);
    setCoursesBySchool(coursesRes.data ?? []);
    setTeachersBySchool(teachersRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredCourses = coursesBySchool.filter(c => !form.school_id || c.school_id === form.school_id);
  const filteredTeachers = teachersBySchool.filter(t => !form.school_id || t.school_id === form.school_id);

  const handleCreate = async () => {
    if (!form.school_id) { setFormError('Vui lòng chọn cơ sở'); return; }
    if (!form.course_id) { setFormError('Vui lòng chọn khoá học'); return; }
    if (!form.code.trim()) { setFormError('Vui lòng nhập mã lớp'); return; }
    if (!form.name.trim()) { setFormError('Vui lòng nhập tên lớp'); return; }
    setSaving(true); setFormError('');
    try {
      const { error } = await supabase.from('classes').insert({
        school_id: form.school_id,
        course_id: form.course_id,
        teacher_id: form.teacher_id || null,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        section: form.section.trim() || null,
        room: form.room.trim() || null,
        schedule: form.schedule.trim() || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        max_students: form.max_students ? parseInt(form.max_students) : null,
        status: form.status,
      });
      if (error) throw new Error(error.message);
      setShowForm(false); setForm(BLANK_FORM);
      load();
    } catch (e: any) {
      setFormError(e.message ?? 'Lỗi khi tạo lớp học');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cls: ClassRow) => {
    if (!window.confirm(`Xoá lớp "${cls.name}"?\nTất cả dữ liệu điểm danh, đăng ký thuộc lớp này cũng bị xoá. Hành động không thể hoàn tác.`)) return;
    setDeletingId(cls.id);
    try {
      const { error } = await supabase.from('classes').delete().eq('id', cls.id);
      if (error) throw new Error(error.message);
      load();
    } catch (e: any) {
      alert(e.message ?? 'Lỗi khi xoá');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = classes.filter(c => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchSchool = !filterSchool || c.school_id === filterSchool;
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchSchool && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy font-display">Lớp Học</h1>
          <p className="text-charcoal/60 font-body text-sm mt-1">Quản lý tất cả lớp học toàn hệ thống</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError(''); setForm(BLANK_FORM); }}
          className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm lớp học
        </button>
      </div>

      {showForm && (
        <div className="bg-cream border border-gold/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy font-body">Tạo lớp học mới</p>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-cream-dark rounded-lg text-charcoal/60"><X className="w-4 h-4" /></button>
          </div>
          {formError && <p className="text-sm text-red-600 font-body">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Cơ sở *</label>
              <select value={form.school_id}
                onChange={e => setForm(f => ({ ...f, school_id: e.target.value, course_id: '', teacher_id: '' }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                <option value="">— Chọn cơ sở —</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Khoá học *</label>
              <select value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
                disabled={!form.school_id}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white disabled:opacity-40">
                <option value="">— Chọn khoá học —</option>
                {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Mã lớp *</label>
              <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                placeholder="VD: PIANO-A1-2024"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Tên lớp *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="VD: Piano Cơ Bản A1"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Giáo viên</label>
              <select value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}
                disabled={!form.school_id}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white disabled:opacity-40">
                <option value="">— Chưa phân công —</option>
                {filteredTeachers.map(t => <option key={t.id} value={t.id}>{t.last_name} {t.first_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Phòng học</label>
              <input type="text" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
                placeholder="VD: P.101"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Lịch học</label>
              <input type="text" value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
                placeholder="VD: T2-T4-T6, 18:00-19:30"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Sĩ số tối đa</label>
              <input type="number" min="1" value={form.max_students} onChange={e => setForm(f => ({ ...f, max_students: e.target.value }))}
                placeholder="VD: 20"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Ngày bắt đầu</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Ngày kết thúc</label>
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-body text-charcoal/60 hover:text-charcoal transition-colors">Huỷ</button>
            <button onClick={handleCreate} disabled={saving}
              className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors disabled:opacity-50">
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Check className="w-4 h-4" />}
              Tạo lớp học
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
          <input type="text" placeholder="Tên hoặc mã lớp..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white w-56" />
        </div>
        <select value={filterSchool} onChange={e => setFilterSchool(e.target.value)}
          className="px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
          <option value="">Tất cả cơ sở</option>
          {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
          <option value="">Tất cả trạng thái</option>
          {Object.entries(statusLabel).map(([val, lbl]) => (
            <option key={val} value={val}>{lbl}</option>
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
            <GraduationCap className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
            <p className="text-charcoal/50 font-body">Không tìm thấy lớp học nào</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-cream border-b border-gold/20">
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Lớp học</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide hidden md:table-cell">Khoá học</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide hidden lg:table-cell">Giáo viên</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide hidden lg:table-cell">Cơ sở</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide hidden xl:table-cell">Lịch</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {filtered.map(cls => (
                <tr key={cls.id} className="hover:bg-cream/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy font-body">{cls.name}</p>
                        <p className="text-xs text-charcoal/50 font-body mt-0.5">{cls.code}{cls.room ? ` · ${cls.room}` : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-charcoal/30" />
                      <p className="text-sm text-charcoal/60 font-body">{cls.courses?.name ?? '—'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-charcoal/30" />
                      <p className="text-sm text-charcoal/60 font-body">
                        {cls.teachers ? `${cls.teachers.last_name} ${cls.teachers.first_name}` : '—'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-charcoal/30" />
                      <p className="text-sm text-charcoal/60 font-body">{cls.schools?.name ?? '—'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden xl:table-cell">
                    <p className="text-sm text-charcoal/60 font-body">{cls.schedule ?? '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium font-body ${statusColor[cls.status] ?? 'bg-cream text-charcoal/50'}`}>
                      {statusLabel[cls.status] ?? cls.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => handleDelete(cls)}
                      disabled={deletingId === cls.id}
                      className="p-1.5 text-charcoal/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xoá lớp học"
                    >
                      {deletingId === cls.id
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
            <p className="text-xs text-charcoal/50 font-body">Hiển thị {filtered.length} / {classes.length} lớp học</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SuperAdminClassesPage() {
  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <SuperAdminClassesContent />
    </RoleGuard>
  );
}
