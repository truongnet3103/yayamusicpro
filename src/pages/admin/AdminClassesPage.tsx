import {
  BookOpen, Plus, Search, Calendar, Users, X, Check, Trash2,
  GraduationCap, User, Pencil, ChevronDown, ChevronUp, UserPlus, UserMinus, Clock, CalendarPlus,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { supabase } from '../../shared/lib/supabase';

interface ClassRow {
  id: string;
  course_id: string;
  teacher_id: string | null;
  code: string;
  name: string;
  section: string | null;
  room: string | null;
  schedule: string | null;
  schedule_days: string[] | null;
  start_time: string | null;
  end_time: string | null;
  start_date: string | null;
  end_date: string | null;
  max_students: number | null;
  status: string;
  created_at: string;
  courses: { name: string; code: string } | null;
  teachers: { first_name: string; last_name: string } | null;
  enrollment_count: number;
}

interface EnrolledStudent {
  enrollment_id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  student_code: string | null;
  enrollment_date: string;
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

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Thứ 2' },
  { key: 'tue', label: 'Thứ 3' },
  { key: 'wed', label: 'Thứ 4' },
  { key: 'thu', label: 'Thứ 5' },
  { key: 'fri', label: 'Thứ 6' },
  { key: 'sat', label: 'Thứ 7' },
  { key: 'sun', label: 'CN' },
];

const DAY_SHORT: Record<string, string> = {
  mon: 'T2', tue: 'T3', wed: 'T4', thu: 'T5', fri: 'T6', sat: 'T7', sun: 'CN',
};

const BLANK_FORM = {
  course_id: '',
  teacher_id: '',
  code: '',
  name: '',
  section: '',
  room: '',
  schedule: '',
  schedule_days: [] as string[],
  start_time: '',
  end_time: '',
  start_date: '',
  end_date: '',
  max_students: '',
  status: 'active',
  slot_id: '',
};

function AdminClassesPageContent() {
  const { profile, role } = useUser();
  const isSuperAdmin = role === 'super_admin';
  const schoolId = profile?.school_id ?? '';

  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [allStudents, setAllStudents] = useState<{ id: string; first_name: string; last_name: string; student_code: string | null }[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<{ id: string; label: string; period: string; start_time: string; end_time: string }[]>([]);
  // For super_admin: list of all schools + selected school filter
  const [allSchools, setAllSchools] = useState<{ id: string; name: string }[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const effectiveSchoolId = isSuperAdmin ? selectedSchoolId : schoolId;
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRow | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Enrollment management state
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<Record<string, EnrolledStudent[]>>({});
  const [loadingEnrollments, setLoadingEnrollments] = useState<string | null>(null);
  const [addStudentId, setAddStudentId] = useState<Record<string, string>>({});
  const [addingStudent, setAddingStudent] = useState<string | null>(null);
  const [removingEnrollment, setRemovingEnrollment] = useState<string | null>(null);

  // Session creation state
  const [sessionClassId, setSessionClassId] = useState<string | null>(null);
  const [sessionForm, setSessionForm] = useState({ session_date: new Date().toISOString().slice(0, 10), start_time: '', end_time: '' });
  const [savingSession, setSavingSession] = useState(false);
  const [sessionError, setSessionError] = useState('');

  const load = useCallback(async () => {
    if (!isSuperAdmin && !schoolId) return;
    // Super admin: load schools list first if not loaded
    if (isSuperAdmin && allSchools.length === 0) {
      const { data: schoolsData } = await supabase.from('schools').select('id, name').order('name');
      setAllSchools(schoolsData ?? []);
    }
    if (!effectiveSchoolId) {
      // Super admin hasn't selected a school yet — show empty
      setLoading(false);
      return;
    }
    const [classesRes, coursesRes, teachersRes, studentsRes, slotsRes] = await Promise.all([
      supabase
        .from('classes')
        .select('id, course_id, teacher_id, code, name, section, room, schedule, schedule_days, start_time, end_time, start_date, end_date, max_students, status, created_at, courses(name, code), teachers(first_name, last_name)')
        .eq('school_id', effectiveSchoolId)
        .order('created_at', { ascending: false }),
      supabase.from('courses').select('id, name').eq('school_id', effectiveSchoolId).eq('is_active', true).order('name'),
      supabase.from('teachers').select('id, first_name, last_name').eq('school_id', effectiveSchoolId).order('last_name'),
      supabase.from('students').select('id, first_name, last_name, student_code').eq('school_id', effectiveSchoolId).order('last_name'),
      supabase.from('schedule_slots').select('id, label, period, start_time, end_time').eq('school_id', effectiveSchoolId).eq('is_active', true).order('period').order('sort_order'),
    ]);

    // Get enrollment counts
    const classRows = (classesRes.data ?? []) as any[];
    let countMap: Record<string, number> = {};
    if (classRows.length > 0) {
      const { data: enrData } = await supabase
        .from('enrollments')
        .select('class_id')
        .in('class_id', classRows.map(c => c.id))
        .eq('status', 'active');
      (enrData ?? []).forEach((e: any) => {
        countMap[e.class_id] = (countMap[e.class_id] || 0) + 1;
      });
    }

    setClasses(classRows.map(c => ({ ...c, enrollment_count: countMap[c.id] || 0 })));
    setCourses(coursesRes.data ?? []);
    setTeachers(teachersRes.data ?? []);
    setAllStudents(studentsRes.data ?? []);
    setScheduleSlots((slotsRes.data ?? []) as any[]);
    setLoading(false);
  }, [schoolId, effectiveSchoolId, isSuperAdmin]);

  useEffect(() => { load(); }, [load, selectedSchoolId]);

  const loadEnrollments = async (classId: string) => {
    setLoadingEnrollments(classId);
    const { data } = await supabase
      .from('enrollments')
      .select('id, student_id, enrollment_date, students(first_name, last_name, student_code)')
      .eq('class_id', classId)
      .eq('status', 'active')
      .order('enrollment_date');
    setEnrolledStudents(prev => ({
      ...prev,
      [classId]: (data ?? []).map((e: any) => ({
        enrollment_id: e.id,
        student_id: e.student_id,
        first_name: e.students?.first_name ?? '',
        last_name: e.students?.last_name ?? '',
        student_code: e.students?.student_code ?? null,
        enrollment_date: e.enrollment_date,
      })),
    }));
    setLoadingEnrollments(null);
  };

  const toggleExpand = (classId: string) => {
    if (expandedClassId === classId) {
      setExpandedClassId(null);
    } else {
      setExpandedClassId(classId);
      if (!enrolledStudents[classId]) loadEnrollments(classId);
    }
  };

  const handleAddStudent = async (cls: ClassRow) => {
    const studentId = addStudentId[cls.id];
    if (!studentId) return;
    setAddingStudent(cls.id);
    const { error } = await supabase.from('enrollments').insert({
      school_id: effectiveSchoolId,
      class_id: cls.id,
      student_id: studentId,
      enrollment_date: new Date().toISOString().slice(0, 10),
      status: 'active',
    });
    if (!error) {
      setAddStudentId(prev => ({ ...prev, [cls.id]: '' }));
      await loadEnrollments(cls.id);
      await load();
    } else {
      alert(error.message);
    }
    setAddingStudent(null);
  };

  const handleRemoveStudent = async (classId: string, enrollmentId: string) => {
    if (!window.confirm('Xoá học sinh khỏi lớp này?')) return;
    setRemovingEnrollment(enrollmentId);
    const { error } = await supabase
      .from('enrollments')
      .update({ status: 'dropped', dropped_date: new Date().toISOString().slice(0, 10) })
      .eq('id', enrollmentId);
    if (!error) {
      await loadEnrollments(classId);
      await load();
    } else {
      alert(error.message);
    }
    setRemovingEnrollment(null);
  };

  const openCreate = () => {
    setEditingClass(null);
    setForm(BLANK_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (cls: ClassRow) => {
    setEditingClass(cls);
    setForm({
      course_id: cls.course_id,
      teacher_id: cls.teacher_id ?? '',
      code: cls.code,
      name: cls.name,
      section: cls.section ?? '',
      room: cls.room ?? '',
      schedule: cls.schedule ?? '',
      schedule_days: cls.schedule_days ?? [],
      start_time: cls.start_time ?? '',
      end_time: cls.end_time ?? '',
      start_date: cls.start_date ?? '',
      end_date: cls.end_date ?? '',
      max_students: cls.max_students?.toString() ?? '',
      status: cls.status,
      slot_id: (cls as any).slot_id ?? '',
    });
    setFormError('');
    setShowForm(true);
  };

  const toggleDay = (day: string) => {
    setForm(f => ({
      ...f,
      schedule_days: f.schedule_days.includes(day)
        ? f.schedule_days.filter(d => d !== day)
        : [...f.schedule_days, day],
    }));
  };

  const handleSave = async () => {
    if (!form.course_id) { setFormError('Vui lòng chọn khoá học'); return; }
    if (!form.code.trim()) { setFormError('Vui lòng nhập mã lớp'); return; }
    if (!form.name.trim()) { setFormError('Vui lòng nhập tên lớp'); return; }
    setSaving(true); setFormError('');
    const payload = {
      course_id: form.course_id,
      teacher_id: form.teacher_id || null,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      section: form.section.trim() || null,
      room: form.room.trim() || null,
      schedule: form.schedule.trim() || null,
      schedule_days: form.schedule_days.length > 0 ? form.schedule_days : null,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      slot_id: (form as any).slot_id || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      max_students: form.max_students ? parseInt(form.max_students) : null,
      status: form.status,
    };
    try {
      let error;
      if (editingClass) {
        ({ error } = await supabase.from('classes').update(payload).eq('id', editingClass.id));
      } else {
        ({ error } = await supabase.from('classes').insert({ ...payload, school_id: effectiveSchoolId }));
      }
      if (error) throw new Error(error.message);
      setShowForm(false); setForm(BLANK_FORM); setEditingClass(null);
      load();
    } catch (e: any) {
      setFormError(e.message ?? 'Lỗi khi lưu lớp học');
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

  const openSessionForm = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    setSessionClassId(classId);
    setSessionForm({
      session_date: new Date().toISOString().slice(0, 10),
      start_time: cls?.start_time?.slice(0, 5) ?? '',
      end_time: cls?.end_time?.slice(0, 5) ?? '',
    });
    setSessionError('');
  };

  const createSession = async (cls: ClassRow) => {
    if (!sessionForm.session_date) { setSessionError('Vui lòng chọn ngày'); return; }
    if (!cls.teacher_id) { setSessionError('Lớp này chưa có giáo viên được phân công'); return; }
    setSavingSession(true); setSessionError('');
    const { error } = await supabase.from('class_sessions').insert({
      class_id: cls.id,
      school_id: effectiveSchoolId,
      teacher_id: cls.teacher_id,
      session_date: sessionForm.session_date,
      start_time: sessionForm.start_time || cls.start_time || null,
      end_time: sessionForm.end_time || cls.end_time || null,
      status: 'scheduled',
    });
    setSavingSession(false);
    if (error) { setSessionError(error.message); return; }
    setSessionClassId(null);
  };

  const filtered = classes.filter(c => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy font-display">Quản Lý Lớp Học</h1>
          <p className="text-charcoal/60 font-body text-sm mt-1">Quản lý lớp học, phân công giáo viên và học sinh</p>
        </div>
        <button
          onClick={openCreate}
          disabled={isSuperAdmin && !selectedSchoolId}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-body font-semibold text-sm shadow-sm disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          Tạo lớp học
        </button>
      </div>

      {/* Super admin: school picker */}
      {isSuperAdmin && (
        <div className="bg-cream border border-gold/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-sm font-medium text-navy font-body whitespace-nowrap">Chọn cơ sở:</span>
          <select
            value={selectedSchoolId}
            onChange={e => { setSelectedSchoolId(e.target.value); setClasses([]); setLoading(true); }}
            className="flex-1 max-w-xs px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          >
            <option value="">— Chọn cơ sở để xem lớp học —</option>
            {allSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {!selectedSchoolId && (
            <p className="text-xs text-charcoal/50 font-body">Chọn cơ sở để xem và quản lý lớp học</p>
          )}
        </div>
      )}

      {showForm && (
        <div className="bg-cream border border-gold/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy font-body">
              {editingClass ? `Chỉnh sửa: ${editingClass.name}` : 'Tạo lớp học mới'}
            </p>
            <button onClick={() => { setShowForm(false); setEditingClass(null); }} className="p-1 hover:bg-cream-dark rounded-lg text-charcoal/60">
              <X className="w-4 h-4" />
            </button>
          </div>
          {formError && <p className="text-sm text-red-600 font-body">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Khoá học *</label>
              <select value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                <option value="">— Chọn khoá học —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Giáo viên</label>
              <select value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                <option value="">— Chưa phân công —</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.last_name} {t.first_name}</option>)}
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
              <label className="block text-xs font-medium text-navy font-body mb-1">Phòng học</label>
              <input type="text" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
                placeholder="VD: P.101"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Sĩ số tối đa</label>
              <input type="number" min="1" value={form.max_students} onChange={e => setForm(f => ({ ...f, max_students: e.target.value }))}
                placeholder="VD: 20"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>

            {/* Schedule Days */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-navy font-body mb-2">Ngày học trong tuần</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => toggleDay(day.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium font-body transition-colors ${
                      form.schedule_days.includes(day.key)
                        ? 'bg-primary text-white'
                        : 'bg-white border border-gold/30 text-charcoal/60 hover:border-primary/40'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Slot picker — chọn khung giờ đã config */}
            {scheduleSlots.length > 0 && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-navy font-body mb-1">Khung giờ học (từ cài đặt)</label>
                <select
                  value={(form as any).slot_id ?? ''}
                  onChange={e => {
                    const slot = scheduleSlots.find(s => s.id === e.target.value);
                    setForm(f => ({
                      ...f,
                      slot_id: e.target.value,
                      start_time: slot ? slot.start_time.slice(0, 5) : f.start_time,
                      end_time: slot ? slot.end_time.slice(0, 5) : f.end_time,
                    } as any));
                  }}
                  className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
                  <option value="">— Chọn khung giờ hoặc nhập tay bên dưới —</option>
                  {(['morning', 'afternoon', 'evening'] as const).map(period => {
                    const periodSlots = scheduleSlots.filter(s => s.period === period);
                    if (!periodSlots.length) return null;
                    const periodLabel = period === 'morning' ? '🌅 Buổi sáng' : period === 'afternoon' ? '☀️ Buổi chiều' : '🌙 Buổi tối';
                    return (
                      <optgroup key={period} label={periodLabel}>
                        {periodSlots.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.label} — {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
                <p className="text-xs text-charcoal/40 font-body mt-1">Chọn slot sẽ tự điền giờ bắt đầu / kết thúc bên dưới</p>
              </div>
            )}

            {/* Start/End Time */}
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Giờ bắt đầu</label>
              <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Giờ kết thúc</label>
              <input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>

            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Ngày bắt đầu khoá</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Ngày kết thúc khoá</label>
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>

            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Trạng thái</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                {Object.entries(statusLabel).map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowForm(false); setEditingClass(null); }} className="px-4 py-2 text-sm font-body text-charcoal/60 hover:text-charcoal transition-colors">Huỷ</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors disabled:opacity-50">
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Check className="w-4 h-4" />}
              {editingClass ? 'Lưu thay đổi' : 'Tạo lớp học'}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="bg-white rounded-xl border border-gold/20 flex-1 min-w-48">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
            <input type="text" placeholder="Tìm kiếm lớp học..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-transparent font-body text-sm focus:outline-none" />
          </div>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
          <option value="">Tất cả trạng thái</option>
          {Object.entries(statusLabel).map(([val, lbl]) => (
            <option key={val} value={val}>{lbl}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gold/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy font-display mb-2">Chưa có lớp học nào</h3>
          <p className="text-charcoal/60 font-body text-sm mb-4">
            {search ? 'Thử thay đổi từ khoá tìm kiếm' : 'Bắt đầu bằng cách tạo lớp học đầu tiên'}
          </p>
          {!search && (
            <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-body font-semibold text-sm">
              Tạo lớp học
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(cls => {
            const isExpanded = expandedClassId === cls.id;
            const enrolled = enrolledStudents[cls.id] ?? [];
            const enrolledIds = new Set(enrolled.map(e => e.student_id));
            const availableStudents = allStudents.filter(s => !enrolledIds.has(s.id));

            return (
              <div key={cls.id} className="bg-white rounded-xl shadow-card border border-gold/20 overflow-hidden">
                {/* Class Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-navy font-body">{cls.name}</h3>
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-medium font-body ${statusColor[cls.status] ?? 'bg-cream text-charcoal/50'}`}>
                            {statusLabel[cls.status] ?? cls.status}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal/50 font-body mt-0.5">{cls.code}</p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                          {cls.courses && (
                            <div className="flex items-center gap-1.5 text-xs text-charcoal/60 font-body">
                              <BookOpen className="w-3.5 h-3.5 text-charcoal/30" />
                              <span>{cls.courses.name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-charcoal/60 font-body">
                            <Users className="w-3.5 h-3.5 text-charcoal/30" />
                            <span>{cls.enrollment_count} học viên{cls.max_students ? ` / tối đa ${cls.max_students}` : ''}</span>
                          </div>
                          {cls.teachers && (
                            <div className="flex items-center gap-1.5 text-xs text-charcoal/60 font-body">
                              <User className="w-3.5 h-3.5 text-charcoal/30" />
                              <span>GV: {cls.teachers.last_name} {cls.teachers.first_name}</span>
                            </div>
                          )}
                          {cls.schedule_days && cls.schedule_days.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-charcoal/60 font-body">
                              <Calendar className="w-3.5 h-3.5 text-charcoal/30" />
                              <span>{cls.schedule_days.map(d => DAY_SHORT[d] ?? d).join(', ')}</span>
                              {cls.start_time && (
                                <span>• {cls.start_time.slice(0, 5)}
                                  {cls.end_time ? `–${cls.end_time.slice(0, 5)}` : ''}
                                </span>
                              )}
                            </div>
                          )}
                          {(!cls.schedule_days || cls.schedule_days.length === 0) && cls.schedule && (
                            <div className="flex items-center gap-1.5 text-xs text-charcoal/60 font-body">
                              <Clock className="w-3.5 h-3.5 text-charcoal/30" />
                              <span>{cls.schedule}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                      <button
                        onClick={() => sessionClassId === cls.id ? setSessionClassId(null) : openSessionForm(cls.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors font-body ${sessionClassId === cls.id ? 'bg-primary/10 text-primary' : 'text-charcoal/60 hover:text-primary hover:bg-primary/5'}`}
                        title="Tạo buổi dạy"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleExpand(cls.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-charcoal/60 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors font-body"
                        title="Quản lý học sinh"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Học viên</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => openEdit(cls)}
                        className="p-1.5 text-charcoal/40 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        title="Chỉnh sửa lớp học"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
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
                    </div>
                  </div>
                </div>

                {/* Enrollment Panel */}
                {isExpanded && (
                  <div className="border-t border-gold/20 bg-cream/30 p-5 space-y-3">
                    <p className="text-xs font-semibold text-navy font-body">Danh sách học viên trong lớp</p>

                    {loadingEnrollments === cls.id ? (
                      <div className="flex items-center gap-2 text-xs text-charcoal/50 font-body">
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-primary"></div>
                        Đang tải...
                      </div>
                    ) : enrolled.length === 0 ? (
                      <p className="text-xs text-charcoal/50 font-body">Chưa có học viên nào trong lớp</p>
                    ) : (
                      <div className="space-y-1.5">
                        {enrolled.map(e => (
                          <div key={e.enrollment_id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gold/15">
                            <div>
                              <span className="text-sm font-body text-navy">{e.last_name} {e.first_name}</span>
                              {e.student_code && <span className="text-xs text-charcoal/40 font-body ml-2">#{e.student_code}</span>}
                            </div>
                            <button
                              onClick={() => handleRemoveStudent(cls.id, e.enrollment_id)}
                              disabled={removingEnrollment === e.enrollment_id}
                              className="p-1 text-charcoal/30 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Xoá khỏi lớp"
                            >
                              {removingEnrollment === e.enrollment_id
                                ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-red-400"></div>
                                : <UserMinus className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Student */}
                    <div className="flex gap-2 pt-1">
                      <select
                        value={addStudentId[cls.id] ?? ''}
                        onChange={e => setAddStudentId(prev => ({ ...prev, [cls.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                      >
                        <option value="">— Chọn học viên để thêm —</option>
                        {availableStudents.map(s => (
                          <option key={s.id} value={s.id}>{s.last_name} {s.first_name}{s.student_code ? ` (${s.student_code})` : ''}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAddStudent(cls)}
                        disabled={!addStudentId[cls.id] || addingStudent === cls.id}
                        className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-light text-xs font-body font-semibold transition-colors disabled:opacity-40"
                      >
                        {addingStudent === cls.id
                          ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                          : <UserPlus className="w-3.5 h-3.5" />}
                        Thêm
                      </button>
                    </div>
                  </div>
                )}
                {/* Session Creation Panel */}
                {sessionClassId === cls.id && (
                  <div className="border-t border-gold/20 bg-primary/5 p-5 space-y-3">
                    <p className="text-xs font-semibold text-navy font-body">Tạo buổi dạy cho lớp này</p>
                    {sessionError && <p className="text-xs text-red-600 font-body">{sessionError}</p>}
                    {!cls.teacher_id && (
                      <p className="text-xs text-amber-600 font-body">⚠️ Lớp chưa có giáo viên — vui lòng phân công giáo viên trước</p>
                    )}
                    <div className="flex flex-wrap gap-3 items-end">
                      <div>
                        <label className="block text-xs font-medium text-navy font-body mb-1">Ngày dạy *</label>
                        <input type="date" value={sessionForm.session_date}
                          onChange={e => setSessionForm(f => ({ ...f, session_date: e.target.value }))}
                          className="px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-navy font-body mb-1">Giờ bắt đầu</label>
                        <input type="time" value={sessionForm.start_time}
                          onChange={e => setSessionForm(f => ({ ...f, start_time: e.target.value }))}
                          className="px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-navy font-body mb-1">Giờ kết thúc</label>
                        <input type="time" value={sessionForm.end_time}
                          onChange={e => setSessionForm(f => ({ ...f, end_time: e.target.value }))}
                          className="px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => createSession(cls)}
                          disabled={savingSession || !cls.teacher_id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-light text-xs font-body font-semibold transition-colors disabled:opacity-40"
                        >
                          {savingSession ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div> : <CalendarPlus className="w-3.5 h-3.5" />}
                          Tạo buổi
                        </button>
                        <button
                          onClick={() => setSessionClassId(null)}
                          className="px-3 py-2 text-xs font-body text-charcoal/60 hover:text-charcoal border border-gold/30 rounded-lg transition-colors"
                        >
                          Huỷ
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminClassesPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'staff', 'super_admin']}>
      <AdminClassesPageContent />
    </RoleGuard>
  );
}
