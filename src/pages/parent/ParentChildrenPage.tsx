import { Users, BookOpen, Clock, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { supabase } from '../../shared/lib/supabase';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string | null;
  classes: ChildClass[];
}

interface ChildClass {
  id: string;
  name: string;
  schedule_days: string[] | null;
  start_time: string | null;
  end_time: string | null;
  course_name: string | null;
  teacher_name: string | null;
}

const DAY_LABELS: Record<string, string> = {
  mon: 'T2', tue: 'T3', wed: 'T4', thu: 'T5', fri: 'T6', sat: 'T7', sun: 'CN',
};

function ParentChildrenContent() {
  const { profile } = useUser();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;

    const load = async () => {
      setLoading(true);

      // Step 1: get parent record
      const { data: parentRow } = await supabase
        .from('parents')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (!parentRow) { setLoading(false); return; }

      // Step 2: get linked students
      const { data: links } = await supabase
        .from('student_parents')
        .select('students(id, first_name, last_name, grade_level)')
        .eq('parent_id', parentRow.id);

      const studentRows = (links ?? [])
        .map((l: any) => l.students)
        .filter(Boolean);

      if (studentRows.length === 0) { setChildren([]); setLoading(false); return; }

      // Step 3: for each student get active class enrollments with class details
      const studentIds = studentRows.map((s: any) => s.id);
      const { data: enr } = await supabase
        .from('enrollments')
        .select(`
          student_id,
          classes(
            id, name, schedule_days, start_time, end_time,
            courses(name),
            teachers(first_name, last_name)
          )
        `)
        .in('student_id', studentIds)
        .eq('status', 'active');

      const classMap: Record<string, ChildClass[]> = {};
      for (const e of (enr ?? []) as any[]) {
        const sid = e.student_id;
        const c = e.classes;
        if (!c) continue;
        if (!classMap[sid]) classMap[sid] = [];
        classMap[sid].push({
          id: c.id,
          name: c.name,
          schedule_days: c.schedule_days,
          start_time: c.start_time,
          end_time: c.end_time,
          course_name: c.courses?.name ?? null,
          teacher_name: c.teachers ? `${c.teachers.first_name} ${c.teachers.last_name}` : null,
        });
      }

      setChildren(
        studentRows.map((s: any) => ({
          id: s.id,
          first_name: s.first_name,
          last_name: s.last_name,
          grade_level: s.grade_level ?? null,
          classes: classMap[s.id] ?? [],
        }))
      );
      setLoading(false);
    };

    load();
  }, [profile?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy font-display">Con Em Của Tôi</h1>
        <p className="text-charcoal/60 font-body text-sm mt-1">Thông tin lớp học của con em bạn</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : children.length === 0 ? (
        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-12 text-center">
          <Users className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-navy font-display mb-2">Chưa Liên Kết Học Viên</h3>
          <p className="text-charcoal/60 font-body text-sm">Liên hệ quản trị viên trung tâm để liên kết tài khoản học viên.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {children.map(child => (
            <div key={child.id} className="bg-white rounded-xl border border-gold/20 shadow-card overflow-hidden">
              {/* Child header */}
              <div className="bg-cream/50 px-6 py-4 border-b border-gold/20 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-primary font-body">{child.first_name[0]}</span>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-navy font-body">{child.first_name} {child.last_name}</h2>
                  {child.grade_level && (
                    <p className="text-xs text-charcoal/50 font-body flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3 h-3" />
                      Trình độ: {child.grade_level}
                    </p>
                  )}
                </div>
                <span className="ml-auto text-xs font-body text-charcoal/40">{child.classes.length} lớp đang học</span>
              </div>

              {/* Classes list */}
              {child.classes.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-charcoal/40 font-body text-sm">Chưa đăng ký lớp nào</p>
                </div>
              ) : (
                <div className="divide-y divide-gold/10">
                  {child.classes.map(cls => (
                    <div key={cls.id} className="px-6 py-4 flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg self-start">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-navy font-body">{cls.name}</p>
                        {cls.course_name && <p className="text-xs text-charcoal/50 font-body">{cls.course_name}</p>}
                        <div className="flex flex-wrap gap-3 mt-1.5">
                          {cls.start_time && (
                            <span className="inline-flex items-center gap-1 text-xs text-charcoal/60 font-body">
                              <Clock className="w-3 h-3" />
                              {cls.start_time.slice(0, 5)}{cls.end_time ? ` – ${cls.end_time.slice(0, 5)}` : ''}
                            </span>
                          )}
                          {cls.teacher_name && (
                            <span className="text-xs text-charcoal/60 font-body">GV: {cls.teacher_name}</span>
                          )}
                        </div>
                        {cls.schedule_days && cls.schedule_days.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {cls.schedule_days.map(d => (
                              <span key={d} className="text-xs px-1.5 py-0.5 bg-gold/10 text-gold rounded font-body">
                                {DAY_LABELS[d] ?? d}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ParentChildrenPage() {
  return (
    <RoleGuard allowedRoles={['parent']}>
      <ParentChildrenContent />
    </RoleGuard>
  );
}
