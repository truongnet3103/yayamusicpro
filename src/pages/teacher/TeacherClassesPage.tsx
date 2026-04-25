import { BookOpen, Users, Search, Calendar, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { supabase } from '../../shared/lib/supabase';

interface TeacherClass {
  id: string;
  name: string;
  code: string;
  course_name?: string;
  grade_level?: string;
  section?: string;
  schedule?: string;
  schedule_days?: string[];
  start_time?: string;
  end_time?: string;
  room?: string;
  status: string;
  student_count: number;
}

const DAY_LABELS: Record<string, string> = {
  mon: 'T2', tue: 'T3', wed: 'T4', thu: 'T5', fri: 'T6', sat: 'T7', sun: 'CN',
};

function TeacherClassesPageContent() {
  const { profile } = useUser();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!profile?.id || !profile?.school_id) return;

    const loadClasses = async () => {
      setLoading(true);
      try {
        // Resolve domain teacher ID from auth user ID
        const { data: teacherRow, error: tErr } = await supabase
          .from('teachers')
          .select('id')
          .eq('user_id', profile.id)
          .eq('school_id', profile.school_id)
          .single();

        if (tErr || !teacherRow) {
          setClasses([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('classes')
          .select(`
            id, name, code, grade_level, section, schedule,
            schedule_days, start_time, end_time, room, status,
            courses(name)
          `)
          .eq('school_id', profile.school_id)
          .eq('teacher_id', teacherRow.id)
          .eq('status', 'active')
          .order('name');

        if (error) throw error;

        // Fetch student counts from enrollments
        let enrollmentCounts: Record<string, number> = {};
        if (data && data.length > 0) {
          const classIds = data.map((cls: any) => cls.id);
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('class_id')
            .in('class_id', classIds)
            .eq('status', 'active');

          enrollmentCounts = (enrollments || []).reduce((acc: Record<string, number>, e: any) => {
            acc[e.class_id] = (acc[e.class_id] || 0) + 1;
            return acc;
          }, {});
        }

        setClasses((data || []).map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          code: cls.code,
          course_name: cls.courses?.name,
          grade_level: cls.grade_level,
          section: cls.section,
          schedule: cls.schedule,
          schedule_days: cls.schedule_days,
          start_time: cls.start_time,
          end_time: cls.end_time,
          room: cls.room,
          status: cls.status,
          student_count: enrollmentCounts[cls.id] || 0,
        })));
      } catch (err) {
        console.error('Error loading classes:', err);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, [profile?.id, profile?.school_id]);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cls.code ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy font-display">Lớp Dạy Của Tôi</h1>
        <p className="text-charcoal/60 font-body text-sm mt-1">Các lớp học được phân công</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
        <input
          type="text"
          placeholder="Tìm kiếm lớp học..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gold/30 rounded-lg bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {filteredClasses.length === 0 ? (
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
          {filteredClasses.map(cls => (
            <div key={cls.id} className="bg-white rounded-xl shadow-card border border-gold/20 p-5 hover:shadow-elegant transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-navy font-body leading-tight">{cls.name}</h3>
                  <p className="text-xs text-charcoal/50 font-body mt-0.5">{cls.code}</p>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                {cls.course_name && (
                  <p className="text-xs text-charcoal/60 font-body">{cls.course_name}</p>
                )}
                <div className="flex items-center gap-1.5 text-xs text-charcoal/60 font-body">
                  <Users className="w-3.5 h-3.5 text-charcoal/30" />
                  <span>{cls.student_count} học viên</span>
                </div>
                {cls.schedule_days && cls.schedule_days.length > 0 ? (
                  <div className="flex items-center gap-1.5 text-xs text-charcoal/60 font-body">
                    <Calendar className="w-3.5 h-3.5 text-charcoal/30" />
                    <span>{cls.schedule_days.map(d => DAY_LABELS[d] ?? d).join(', ')}</span>
                    {cls.start_time && (
                      <span>• {cls.start_time.slice(0, 5)}
                        {cls.end_time ? `–${cls.end_time.slice(0, 5)}` : ''}
                      </span>
                    )}
                  </div>
                ) : cls.schedule ? (
                  <div className="flex items-center gap-1.5 text-xs text-charcoal/60 font-body">
                    <Clock className="w-3.5 h-3.5 text-charcoal/30" />
                    <span className="truncate">{cls.schedule}</span>
                  </div>
                ) : null}
                {cls.room && (
                  <p className="text-xs text-charcoal/50 font-body">Phòng: {cls.room}</p>
                )}
              </div>

              <div className="pt-3 border-t border-gold/20 flex items-center gap-3 text-xs font-body">
                <Link
                  to={`/teacher/attendance/${cls.id}`}
                  className="text-primary hover:text-primary-light font-semibold transition-colors"
                >
                  Điểm danh
                </Link>
                <Link
                  to={`/teacher/gradebook/${cls.id}`}
                  className="text-charcoal/60 hover:text-charcoal transition-colors"
                >
                  Nhật ký
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TeacherClassesPage() {
  return (
    <RoleGuard allowedRoles={['teacher']}>
      <PermissionGuard requiredCapabilities={['classes:read']}>
        <TeacherClassesPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
