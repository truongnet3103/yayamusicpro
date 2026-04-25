/**
 * Teacher Dashboard
 *
 * Role: Teacher
 *
 * TODO: Backend must validate:
 * - User has 'classes:read' and 'attendance:mark' capabilities
 * - Teacher can only see their own classes
 */

import { CheckSquare, BookOpen, Clock, Users, Calendar, Award } from 'lucide-react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { useTeacherOverview } from '../../domains/academic/hooks/useTeacherOverview';
import { DashboardSkeleton } from '../../shared/components/LoadingSkeleton';
import { Link, useNavigate } from 'react-router-dom';

function TeacherDashboardContent() {
  const { profile } = useUser();
  const navigate = useNavigate();
  const { data: overview, loading: overviewLoading } = useTeacherOverview();

  // TODO: Fetch real notifications from API
  const recentNotifications: Array<{
    id: string;
    title: string;
    timestamp: string;
  }> = [];

  const loading = overviewLoading;

  const handleMarkAttendance = (classId: string) => {
    navigate(`/teacher/attendance/${classId}`);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy font-display">Tổng Quan Giảng Viên</h1>
        <p className="text-charcoal/60 font-body text-sm mt-1">Xin chào, {profile?.first_name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-charcoal/60 font-body">Lớp hôm nay</p>
              <p className="text-2xl font-bold text-navy font-display">
                {overview?.today_classes.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gold/20 rounded-xl">
              <Users className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-xs text-charcoal/60 font-body">Tổng học viên</p>
              <p className="text-2xl font-bold text-navy font-display">
                {overview?.total_students || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-navy/10 rounded-xl">
              <CheckSquare className="w-5 h-5 text-navy" />
            </div>
            <div>
              <p className="text-xs text-charcoal/60 font-body">Tỷ lệ điểm danh</p>
              <p className="text-2xl font-bold text-navy font-display">
                {overview?.attendance_rate ? `${overview.attendance_rate}%` : '0%'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-charcoal/60 font-body">Việc cần làm</p>
              <p className="text-2xl font-bold text-navy font-display">
                {overview?.pending_tasks || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
        <h2 className="text-lg font-semibold text-navy font-display mb-4">Lịch Dạy Hôm Nay</h2>
        {overview?.today_classes && overview.today_classes.length > 0 ? (
          <div className="space-y-3">
            {overview.today_classes.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between p-4 bg-cream rounded-xl hover:bg-cream-dark transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-lg">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy font-body text-sm">{cls.name}</h3>
                    <p className="text-xs text-charcoal/60 font-body mt-0.5">
                      {cls.room} • {cls.students} học viên
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-charcoal/70 font-body">{cls.time}</span>
                  <button
                    onClick={() => handleMarkAttendance(cls.id)}
                    className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-body font-semibold text-xs shadow-sm"
                  >
                    Điểm danh
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-charcoal/50">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gold/30" />
            <p className="font-body text-sm">Không có lớp học nào hôm nay</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <h2 className="text-lg font-semibold text-navy font-display mb-4">Thao Tác Nhanh</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/teacher/attendance"
              className="p-4 text-left bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/20 transition-colors"
            >
              <CheckSquare className="w-5 h-5 text-primary mb-2" />
              <p className="text-sm font-medium text-navy font-body">Điểm danh</p>
            </Link>
            <Link
              to="/teacher/classes"
              className="p-4 text-left bg-gold/10 hover:bg-gold/20 rounded-xl border border-gold/30 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-gold mb-2" />
              <p className="text-sm font-medium text-navy font-body">Lớp của tôi</p>
            </Link>
            <Link
              to="/teacher/gradebook"
              className="p-4 text-left bg-navy/5 hover:bg-navy/10 rounded-xl border border-navy/20 transition-colors"
            >
              <Award className="w-5 h-5 text-navy mb-2" />
              <p className="text-sm font-medium text-navy font-body">Nhật ký tiến độ</p>
            </Link>
            <Link
              to="/teacher/schedule"
              className="p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 transition-colors"
            >
              <Calendar className="w-5 h-5 text-orange-500 mb-2" />
              <p className="text-sm font-medium text-navy font-body">Lịch dạy</p>
            </Link>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy font-display">Thông Báo Gần Đây</h2>
            <Link
              to="/teacher/notifications"
              className="text-sm text-primary hover:text-primary-light font-body transition-colors"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-charcoal font-body">{notification.title}</p>
                    <p className="text-xs text-charcoal/40 font-body mt-0.5">
                      {new Date(notification.timestamp).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-charcoal/50 font-body text-center py-4">Không có thông báo mới</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeacherDashboard() {
  return (
    <RoleGuard allowedRoles={['teacher']}>
      <PermissionGuard requiredCapabilities={['classes:read', 'attendance:mark']}>
        <TeacherDashboardContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
