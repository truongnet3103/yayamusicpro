/**
 * Teacher Attendance Page
 *
 * Landing: shows all assigned classes with today's session status.
 * Teachers can see which classes need claiming + mark student attendance.
 * With classId param: full attendance marking interface.
 */

import { CheckSquare, BookOpen, ArrowLeft, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { TeacherAttendanceMarking } from '../../domains/academic/components/attendance/TeacherAttendanceMarking';
import { supabase } from '../../shared/lib/supabase';
import { useUser } from '../../domains/auth/contexts/UserContext';

interface ClassWithSession {
  id: string;
  name: string;
  schedule_days: string[] | null;
  start_time: string | null;
  end_time: string | null;
  room: string | null;
  todaySession: {
    id: string;
    status: 'scheduled' | 'claimed' | 'verified' | 'cancelled';
    claimed_at: string | null;
  } | null;
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS: Record<string, string> = {
  mon: 'T2', tue: 'T3', wed: 'T4', thu: 'T5', fri: 'T6', sat: 'T7', sun: 'CN',
};

const sessionStatusLabel: Record<string, string> = {
  scheduled: 'Chưa xác nhận dạy',
  claimed: 'Đã xác nhận dạy',
  verified: 'Đã kiểm duyệt',
  cancelled: 'Đã huỷ',
};

const sessionStatusColor: Record<string, string> = {
  scheduled: 'bg-gold/20 text-gold',
  claimed: 'bg-blue-100 text-blue-700',
  verified: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function ClassListContent() {
  const { profile } = useUser();
  const [classes, setClasses] = useState<ClassWithSession[]>([]);
  const [loading, setLoading] = useState(true);
  const today = toISO(new Date());
  const todayDayKey = DAY_KEYS[new Date().getDay()];

  useEffect(() => {
    if (!profile?.id) return;
    const load = async () => {
      setLoading(true);

      // Resolve teacher domain ID
      const { data: teacherRow } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (!teacherRow) { setLoading(false); return; }
      const tid = teacherRow.id;

      // Load teacher's active classes
      const { data: classData } = await supabase
        .from('classes')
        .select('id, name, schedule_days, start_time, end_time, room')
        .eq('teacher_id', tid)
        .eq('status', 'active')
        .order('name');

      // Load today's sessions for all those classes
      const classIds = (classData ?? []).map((c: any) => c.id);
      let sessionMap: Record<string, ClassWithSession['todaySession']> = {};
      if (classIds.length > 0) {
        const { data: sessions } = await supabase
          .from('class_sessions')
          .select('id, class_id, status, claimed_at')
          .in('class_id', classIds)
          .eq('session_date', today)
          .eq('teacher_id', tid);

        (sessions ?? []).forEach((s: any) => {
          sessionMap[s.class_id] = { id: s.id, status: s.status, claimed_at: s.claimed_at };
        });
      }

      setClasses((classData ?? []).map((c: any) => ({
        id: c.id,
        name: c.name,
        schedule_days: c.schedule_days,
        start_time: c.start_time,
        end_time: c.end_time,
        room: c.room,
        todaySession: sessionMap[c.id] ?? null,
      })));
      setLoading(false);
    };
    load();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-card border border-gold/20 p-12 text-center">
        <CheckSquare className="w-16 h-16 text-gold/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-navy font-display mb-2">Chưa có lớp học</h3>
        <p className="text-charcoal/60 font-body text-sm">Bạn chưa được phân công lớp nào</p>
      </div>
    );
  }

  // Split: classes scheduled for today vs others
  const todayClasses = classes.filter(c =>
    Array.isArray(c.schedule_days) && c.schedule_days.includes(todayDayKey)
  );
  const otherClasses = classes.filter(c =>
    !Array.isArray(c.schedule_days) || !c.schedule_days.includes(todayDayKey)
  );

  const ClassCard = ({ cls }: { cls: ClassWithSession }) => {
    const hasSession = !!cls.todaySession;
    const sessionStatus = cls.todaySession?.status;
    const needsAttention = hasSession && sessionStatus === 'scheduled';

    return (
      <div className={`bg-white rounded-xl border shadow-card p-5 transition-shadow hover:shadow-elegant ${needsAttention ? 'border-gold/60' : 'border-gold/20'}`}>
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${needsAttention ? 'bg-gold/20' : 'bg-primary/10'}`}>
            <BookOpen className={`w-5 h-5 ${needsAttention ? 'text-gold' : 'text-primary'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-navy font-body leading-tight">{cls.name}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {cls.start_time && (
                <span className="inline-flex items-center gap-1 text-xs text-charcoal/50 font-body">
                  <Clock className="w-3 h-3" />
                  {cls.start_time.slice(0, 5)}{cls.end_time ? `–${cls.end_time.slice(0, 5)}` : ''}
                </span>
              )}
              {cls.room && (
                <span className="text-xs text-charcoal/50 font-body">Phòng {cls.room}</span>
              )}
            </div>
          </div>
        </div>

        {/* Today's session status */}
        {hasSession ? (
          <div className="mb-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium font-body ${sessionStatusColor[sessionStatus!]}`}>
              {needsAttention && <AlertCircle className="w-3 h-3" />}
              {sessionStatusLabel[sessionStatus!]}
            </span>
            {needsAttention && (
              <p className="text-xs text-gold mt-1 font-body">
                Buổi hôm nay chưa được xác nhận — vào Lịch Dạy để claim
              </p>
            )}
          </div>
        ) : (
          <div className="mb-3">
            <span className="text-xs text-charcoal/40 font-body italic">Không có buổi dạy hôm nay</span>
          </div>
        )}

        <div className="pt-3 border-t border-gold/10 flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {(cls.schedule_days ?? []).map(d => (
              <span key={d} className="text-xs px-1.5 py-0.5 bg-gold/10 text-gold rounded font-body">
                {DAY_LABELS[d] ?? d}
              </span>
            ))}
          </div>
          <Link
            to={`/teacher/attendance/${cls.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-body font-semibold text-xs"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Điểm danh
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {todayClasses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-navy font-display">
              Hôm nay — {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayClasses.map(cls => <ClassCard key={cls.id} cls={cls} />)}
          </div>
        </div>
      )}

      {otherClasses.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-navy font-display mb-3">Tất cả lớp được phân công</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherClasses.map(cls => <ClassCard key={cls.id} cls={cls} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function TeacherAttendancePageContent() {
  const { classId } = useParams<{ classId: string }>();

  // With classId → full attendance marking UI
  if (classId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            to="/teacher/attendance"
            className="p-2 hover:bg-cream rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-charcoal/60" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-navy font-display">Điểm Danh Học Viên</h1>
            <p className="text-charcoal/60 font-body text-sm mt-1">Ghi nhận điểm danh cho lớp học</p>
          </div>
        </div>
        <TeacherAttendanceMarking
          classId={classId}
          className="Class Attendance"
        />
      </div>
    );
  }

  // Landing: show class list with today's session status
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy font-display">Điểm Danh</h1>
        <p className="text-charcoal/60 font-body text-sm mt-1">
          Chọn lớp học để điểm danh — xem trạng thái buổi dạy hôm nay
        </p>
      </div>
      <ClassListContent />
    </div>
  );
}

export function TeacherAttendancePage() {
  return (
    <RoleGuard allowedRoles={['teacher']}>
      <PermissionGuard requiredCapabilities={['attendance:mark']}>
        <TeacherAttendancePageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
