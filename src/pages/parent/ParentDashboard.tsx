/**
 * Parent Dashboard
 */

import { Users, CheckSquare, Award, TrendingUp, FileText, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { supabase } from '../../shared/lib/supabase';
import { DashboardSkeleton } from '../../shared/components/LoadingSkeleton';
import { Link } from 'react-router-dom';

interface StudentCard {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  grade: string;
  class_name?: string;
}

function ParentDashboardContent() {
  const { profile } = useUser();
  const [students, setStudents] = useState<StudentCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) { setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      try {
        const { data: parentRow } = await supabase
          .from('parents')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (!parentRow) { setStudents([]); return; }

        const { data: links } = await supabase
          .from('student_parents')
          .select('students(id, first_name, last_name, grade_level)')
          .eq('parent_id', parentRow.id);

        const studentRows = (links ?? []).map((l: any) => l.students).filter(Boolean);
        if (studentRows.length === 0) { setStudents([]); return; }

        const studentIds = studentRows.map((s: any) => s.id);
        const { data: enr } = await supabase
          .from('enrollments')
          .select('student_id, classes(name)')
          .in('student_id', studentIds)
          .eq('status', 'active');

        const classNameMap: Record<string, string> = {};
        for (const e of (enr ?? []) as any[]) {
          if (e.student_id && e.classes?.name && !classNameMap[e.student_id]) {
            classNameMap[e.student_id] = e.classes.name;
          }
        }

        setStudents(studentRows.map((s: any) => ({
          id: s.id,
          first_name: s.first_name,
          last_name: s.last_name,
          full_name: `${s.last_name} ${s.first_name}`,
          grade: s.grade_level ?? '',
          class_name: classNameMap[s.id],
        })));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [profile?.id]);

  const recentNotifications: Array<{ id: string; title: string; timestamp: string }> = [];
  const latestGrades: Array<{ subject: string; grade: string; published: boolean }> = [];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Tổng Quan Phụ Huynh</h1>
        <p className="font-body text-charcoal/70">Chào mừng trở lại, {profile?.first_name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-body text-sm text-charcoal/70">Con em đang học</p>
              <p className="font-display text-3xl font-bold text-primary">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CheckSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-body text-sm text-charcoal/70">Điểm danh tuần này</p>
              <p className="font-display text-3xl font-bold text-primary">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-body text-sm text-charcoal/70">Học phí chưa thanh toán</p>
              <p className="font-display text-3xl font-bold text-primary">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-body text-sm text-charcoal/70">Tin nhắn mới</p>
              <p className="font-display text-3xl font-bold text-primary">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Children */}
      <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
        <h2 className="font-display text-lg font-semibold text-navy mb-4">Con Em Của Tôi</h2>
        {students.length === 0 ? (
          <div className="text-center py-12 text-charcoal/50">
            <Users className="w-12 h-12 mx-auto mb-3 text-charcoal/30" />
            <p className="font-body">Chưa có học viên nào được liên kết với tài khoản</p>
            <p className="font-body text-sm mt-2">Liên hệ quản trị viên trung tâm để liên kết học viên</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {students.map((student) => (
              <Link
                key={student.id}
                to={`/parent/students/${student.id}`}
                className="p-6 bg-cream-dark rounded-xl border border-gold/20 hover:shadow-card transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-display text-2xl font-bold text-primary">
                      {student.first_name[0]}{student.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-body text-lg font-semibold text-navy">{student.full_name}</h3>
                    <p className="font-body text-sm text-charcoal/70">{student.grade}</p>
                    {student.class_name && (
                      <p className="font-body text-xs text-charcoal/50">{student.class_name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm font-body">
                  <span className="text-charcoal/60">Xem chi tiết</span>
                  <span className="text-primary">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-navy">Thông Báo Gần Đây</h2>
            <Link to="/parent/notifications" className="font-body text-sm text-primary hover:text-primary-light">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification: any, i: number) => (
                <div key={i} className="flex items-start gap-3 border-b border-gold/10 pb-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-body text-sm text-navy">{notification.title || 'Thông báo'}</p>
                    <p className="font-body text-xs text-charcoal/50">{notification.timestamp || 'Vừa xong'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-body text-sm text-charcoal/50 text-center py-4">Không có thông báo gần đây</p>
            )}
          </div>
        </div>

        {/* Latest Grades (Published Only) */}
        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-navy">Kết Quả Mới Nhất</h2>
            <Link to="/parent/grades" className="font-body text-sm text-primary hover:text-primary-light">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {latestGrades.length > 0 ? (
              latestGrades
                .filter(grade => grade.published)
                .map((grade, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-cream-dark rounded-lg border-b border-gold/10">
                    <h3 className="font-body text-sm font-medium text-navy">{grade.subject}</h3>
                    <span className="font-display text-sm font-bold text-primary">{grade.grade}</span>
                  </div>
                ))
            ) : (
              <p className="font-body text-sm text-charcoal/50 text-center py-4">Chưa có kết quả học tập</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
        <h2 className="font-display text-lg font-semibold text-navy mb-4">Truy Cập Nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/parent/attendance"
            className="p-4 bg-cream-dark hover:bg-primary/5 rounded-xl border border-gold/20 transition-colors text-center"
          >
            <CheckSquare className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-body text-sm font-medium text-navy">Điểm Danh</p>
          </Link>
          <Link
            to="/parent/grades"
            className="p-4 bg-cream-dark hover:bg-primary/5 rounded-xl border border-gold/20 transition-colors text-center"
          >
            <Award className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-body text-sm font-medium text-navy">Kết Quả</p>
          </Link>
          <Link
            to="/parent/notifications"
            className="p-4 bg-cream-dark hover:bg-primary/5 rounded-xl border border-gold/20 transition-colors text-center"
          >
            <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-body text-sm font-medium text-navy">Thông Báo</p>
          </Link>
          <Link
            to="/parent/messages"
            className="p-4 bg-cream-dark hover:bg-primary/5 rounded-xl border border-gold/20 transition-colors text-center"
          >
            <MessageSquare className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-body text-sm font-medium text-navy">Tin Nhắn</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ParentDashboard() {
  return (
    <RoleGuard allowedRoles={['parent']}>
      <PermissionGuard requiredCapabilities={['students:view']}>
        <ParentDashboardContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
