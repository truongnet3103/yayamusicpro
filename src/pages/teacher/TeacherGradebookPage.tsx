import { Award, BookOpen, Users, Search, ChevronRight, Star, MessageSquare, CheckSquare } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { useTenant } from '../../shared/contexts/TenantContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { supabase } from '../../shared/lib/supabase';

interface TeacherClass {
  id: string;
  name: string;
  code: string;
  course_name?: string;
  student_count?: number;
}

interface StudentRow {
  id: string;
  first_name: string;
  last_name: string;
  present: number;
  absent: number;
  late: number;
  last_note: string;
  last_attendance_id: string | null;
}

function GradebookClassList({ onSelectClass }: { onSelectClass: (classId: string, name: string) => void }) {
  const { profile } = useUser();
  const { school } = useTenant();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const schoolId = school?.id || profile?.school_id;

  useEffect(() => {
    if (!schoolId || !profile?.id) return;

    const load = async () => {
      setLoading(true);
      // Must resolve profile.id → teachers.id first
      const { data: teacherRow } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (!teacherRow) { setLoading(false); return; }

      const { data } = await supabase
        .from('classes')
        .select('id, name, code, courses(name)')
        .eq('school_id', schoolId)
        .eq('teacher_id', teacherRow.id)
        .eq('status', 'active')
        .order('name');

      const classIds = (data ?? []).map((c: any) => c.id);
      let counts: Record<string, number> = {};
      if (classIds.length > 0) {
        const { data: enr } = await supabase
          .from('enrollments')
          .select('class_id')
          .in('class_id', classIds)
          .eq('status', 'active');
        counts = (enr ?? []).reduce<Record<string, number>>((acc, e: any) => {
          acc[e.class_id] = (acc[e.class_id] ?? 0) + 1;
          return acc;
        }, {});
      }

      setClasses(
        (data ?? []).map((c: any) => ({
          id: c.id,
          name: c.name,
          code: c.code,
          course_name: c.courses?.name,
          student_count: counts[c.id] ?? 0,
        }))
      );
      setLoading(false);
    };

    load();
  }, [schoolId, profile?.id]);

  const filtered = classes.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.code ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy font-display">Nhật Ký Tiến Độ</h1>
        <p className="text-charcoal/60 font-body text-sm mt-1">Chọn lớp học để theo dõi tiến độ học viên</p>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gold/20 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
          <input
            type="text"
            placeholder="Tìm kiếm lớp học..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gold/40 rounded-lg bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gold/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy font-display mb-2">
            {searchQuery ? 'Không tìm thấy lớp học' : 'Chưa có lớp học nào'}
          </h3>
          <p className="text-charcoal/60 font-body text-sm">
            {searchQuery ? 'Thử thay đổi từ khóa tìm kiếm' : 'Bạn chưa được phân công lớp học nào'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(cls => (
            <button
              key={cls.id}
              onClick={() => onSelectClass(cls.id, cls.name)}
              className="bg-white rounded-xl shadow-card border border-gold/20 p-6 hover:shadow-elegant transition-shadow text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-navy font-body">{cls.name}</h3>
                    {cls.code && <p className="text-xs text-charcoal/50 font-body mt-0.5">{cls.code}</p>}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-charcoal/30" />
              </div>
              <div className="space-y-1">
                {cls.course_name && <p className="text-sm text-charcoal/60 font-body">{cls.course_name}</p>}
                <div className="flex items-center gap-2 text-sm text-charcoal/60 font-body">
                  <Users className="w-4 h-4 text-charcoal/40" />
                  <span>{cls.student_count} học viên</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GradebookClassView({ classId, className, onBack }: { classId: string; className: string; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'students' | 'eval'>('students');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});

  const loadStudents = useCallback(async () => {
    setLoading(true);
    const { data: enr } = await supabase
      .from('enrollments')
      .select('students(id, first_name, last_name)')
      .eq('class_id', classId)
      .eq('status', 'active');

    const studentIds = (enr ?? []).map((e: any) => e.students?.id).filter(Boolean);

    let attMap: Record<string, { present: number; absent: number; late: number; last_note: string; last_id: string | null }> = {};
    if (studentIds.length > 0) {
      const { data: att } = await supabase
        .from('attendance_records')
        .select('id, student_id, status, notes, attendance_date')
        .eq('class_id', classId)
        .in('student_id', studentIds)
        .order('attendance_date', { ascending: false });

      for (const r of (att ?? []) as any[]) {
        if (!attMap[r.student_id]) {
          attMap[r.student_id] = { present: 0, absent: 0, late: 0, last_note: r.notes ?? '', last_id: r.id };
        }
        if (r.status === 'present') attMap[r.student_id].present++;
        else if (r.status === 'absent') attMap[r.student_id].absent++;
        else if (r.status === 'late') attMap[r.student_id].late++;
      }
    }

    const rows: StudentRow[] = (enr ?? [])
      .filter((e: any) => e.students)
      .map((e: any) => {
        const s = e.students;
        const stats = attMap[s.id] ?? { present: 0, absent: 0, late: 0, last_note: '', last_id: null };
        return {
          id: s.id,
          first_name: s.first_name,
          last_name: s.last_name,
          present: stats.present,
          absent: stats.absent,
          late: stats.late,
          last_note: stats.last_note,
          last_attendance_id: stats.last_id,
        };
      });

    setStudents(rows);
    const notes: Record<string, string> = {};
    rows.forEach(r => { notes[r.id] = r.last_note; });
    setEditNotes(notes);
    setLoading(false);
  }, [classId]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const saveNote = async (student: StudentRow) => {
    if (!student.last_attendance_id) return;
    setSavingId(student.id);
    await supabase
      .from('attendance_records')
      .update({ notes: editNotes[student.id] ?? '' })
      .eq('id', student.last_attendance_id);
    setSavingId(null);
    loadStudents();
  };

  const tabs = [
    { key: 'students' as const, label: 'Học Viên', icon: Users },
    { key: 'eval' as const, label: 'Đánh Giá', icon: Star },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-cream rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-charcoal/60 rotate-180" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-navy font-display">{className}</h1>
          <p className="text-charcoal/60 font-body text-sm mt-1">Theo dõi tiến độ học viên</p>
        </div>
      </div>

      <div className="flex gap-1 bg-cream rounded-xl p-1 w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors ${
                activeTab === tab.key ? 'bg-white text-primary shadow-sm' : 'text-charcoal/60 hover:text-charcoal'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-12 text-center">
          <Users className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
          <p className="text-charcoal/50 font-body">Chưa có học viên nào trong lớp</p>
        </div>
      ) : activeTab === 'students' ? (
        <div className="bg-white rounded-xl border border-gold/20 shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-cream border-b border-gold/20">
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Học viên</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Có mặt</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Vắng</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Trễ</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Tỉ lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {students.map(s => {
                const total = s.present + s.absent + s.late;
                const rate = total > 0 ? Math.round((s.present / total) * 100) : 0;
                return (
                  <tr key={s.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary font-body">{s.first_name[0]}</span>
                        </div>
                        <p className="text-sm font-semibold text-navy font-body">{s.first_name} {s.last_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-green-700 font-body">{s.present}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-red-600 font-body">{s.absent}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gold font-body">{s.late}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-semibold font-body ${rate >= 80 ? 'text-green-600' : rate >= 60 ? 'text-gold' : 'text-red-600'}`}>
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-gold/20 shadow-card p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary font-body">{s.first_name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy font-body mb-2">{s.first_name} {s.last_name}</p>
                  <div className="flex gap-3 mb-3">
                    <span className="text-xs text-green-600 font-body"><CheckSquare className="w-3 h-3 inline mr-0.5" />{s.present} buổi</span>
                    <span className="text-xs text-red-500 font-body">{s.absent} vắng</span>
                    <span className="text-xs text-gold font-body">{s.late} trễ</span>
                  </div>
                  <textarea
                    value={editNotes[s.id] ?? ''}
                    onChange={e => setEditNotes(n => ({ ...n, [s.id]: e.target.value }))}
                    rows={2}
                    placeholder="Nhận xét tiến độ học viên..."
                    className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  {s.last_attendance_id && (
                    <button
                      onClick={() => saveNote(s)}
                      disabled={savingId === s.id}
                      className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-body font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
                    >
                      {savingId === s.id && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />}
                      <MessageSquare className="w-3 h-3" />
                      Lưu nhận xét
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeacherGradebookPageContent() {
  const [selectedClass, setSelectedClass] = useState<{ id: string; name: string } | null>(null);

  if (selectedClass) {
    return (
      <GradebookClassView
        classId={selectedClass.id}
        className={selectedClass.name}
        onBack={() => setSelectedClass(null)}
      />
    );
  }

  return <GradebookClassList onSelectClass={(id, name) => setSelectedClass({ id, name })} />;
}

export function TeacherGradebookPage() {
  return (
    <RoleGuard allowedRoles={['teacher']}>
      <PermissionGuard requiredCapabilities={['grading:read']}>
        <TeacherGradebookPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
