/**
 * Student Dashboard
 *
 * Role: Student
 *
 * TODO: Backend must validate:
 * - User has 'attendance:view' capability (only for their own attendance)
 * - Assignments visible only for enrolled classes
 * - No access to sibling or parent data
 */

import { CheckSquare, Award, FileText, Calendar, TrendingUp } from 'lucide-react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { Link } from 'react-router-dom';

function StudentDashboardContent() {
  const { profile } = useUser();

  // TODO: Fetch real data from APIs
  // GET /students/{id}/overview
  const todaySchedule: Array<{
    id: string;
    name: string;
    time: string;
    room: string;
    teacher: string;
  }> = []; // TODO: GET /students/{id}/schedule?date=today

  const attendanceStatus = {
    rate: 0, // TODO: GET /attendance?student_id={id}&summary=true
    present: 0,
    absent: 0,
  };

  const assignmentsDue: Array<{
    id: string;
    name: string;
    due: string;
    subject: string;
    class_id: string;
  }> = []; // TODO: GET /assignments?student_id={id}&status=pending

  const recentNotifications: Array<{
    id: string;
    title: string;
    timestamp: string;
  }> = []; // TODO: GET /notifications?student_id={id}

  const progress = {
    level: 1, // Gamified progress
    points: 0,
    nextLevel: 100,
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Tổng Quan Học Viên</h1>
        <p className="font-body text-charcoal/70">Chào mừng trở lại, {profile?.first_name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-4">
          <div className="flex flex-col gap-3">
            <div className="p-2 bg-primary/10 rounded-lg w-fit">
              <CheckSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-body text-xs text-charcoal/60">Tỉ lệ điểm danh</p>
              <p className="font-display text-xl font-bold text-navy">
                {attendanceStatus.rate > 0 ? `${attendanceStatus.rate}%` : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-4">
          <div className="flex flex-col gap-3">
            <div className="p-2 bg-primary/10 rounded-lg w-fit">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-body text-xs text-charcoal/60">Điểm trung bình</p>
              <p className="font-display text-xl font-bold text-navy">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-4">
          <div className="flex flex-col gap-3">
            <div className="p-2 bg-gold/10 rounded-lg w-fit">
              <FileText className="w-5 h-5 text-gold-dark" />
            </div>
            <div>
              <p className="font-body text-xs text-charcoal/60">Bài tập cần nộp</p>
              <p className="font-display text-xl font-bold text-navy">{assignmentsDue.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-4">
          <div className="flex flex-col gap-3">
            <div className="p-2 bg-primary/10 rounded-lg w-fit">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-body text-xs text-charcoal/60">Cấp độ {progress.level}</p>
              <p className="font-display text-xl font-bold text-navy">{progress.points} điểm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
        <h2 className="font-display text-lg font-semibold text-navy mb-4">Lịch Học Hôm Nay</h2>
        {todaySchedule.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-charcoal/20" />
            <p className="font-body text-charcoal/50">Hôm nay không có lịch học</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaySchedule.map((cls) => (
              <div
                key={cls.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-cream-dark rounded-xl border border-gold/10 gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-body font-medium text-navy">{cls.name}</h3>
                    <p className="font-body text-sm text-charcoal/60">
                      {cls.teacher} • {cls.room}
                    </p>
                  </div>
                </div>
                <span className="font-body text-sm font-medium text-charcoal/70">{cls.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignments Due */}
        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-navy">Bài Tập Cần Nộp</h2>
            <Link
              to="/student/assignments"
              className="font-body text-sm text-primary hover:text-primary-light transition-colors"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {assignmentsDue.length > 0 ? (
              assignmentsDue.map((assignment) => (
                <Link
                  key={assignment.id}
                  to={`/student/assignments/${assignment.id}`}
                  className="flex items-center justify-between p-3 bg-cream-dark rounded-xl border border-gold/10 hover:bg-primary/5 transition-colors"
                >
                  <div>
                    <h3 className="font-body text-sm font-medium text-navy">{assignment.name}</h3>
                    <p className="font-body text-xs text-charcoal/50">{assignment.subject}</p>
                  </div>
                  <span className="font-body text-xs font-medium text-gold-dark">{assignment.due}</span>
                </Link>
              ))
            ) : (
              <p className="font-body text-sm text-charcoal/50 text-center py-4">Chưa có bài tập nào</p>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-navy">Thông Báo Gần Đây</h2>
            <Link
              to="/student/notifications"
              className="font-body text-sm text-primary hover:text-primary-light transition-colors"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 pb-3 border-b border-gold/10 last:border-0">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="font-body text-sm text-navy">{notification.title}</p>
                    <p className="font-body text-xs text-charcoal/50">
                      {new Date(notification.timestamp).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-body text-sm text-charcoal/50 text-center py-4">Không có thông báo</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
        <h2 className="font-display text-lg font-semibold text-navy mb-4">Truy Cập Nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/student/attendance"
            className="p-4 bg-cream-dark hover:bg-primary/5 rounded-xl border border-gold/20 transition-colors text-center"
          >
            <CheckSquare className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-body text-sm font-medium text-navy">Điểm Danh</p>
          </Link>
          <Link
            to="/student/assignments"
            className="p-4 bg-cream-dark hover:bg-primary/5 rounded-xl border border-gold/20 transition-colors text-center"
          >
            <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-body text-sm font-medium text-navy">Bài Tập</p>
          </Link>
          <Link
            to="/student/grades"
            className="p-4 bg-cream-dark hover:bg-primary/5 rounded-xl border border-gold/20 transition-colors text-center"
          >
            <Award className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-body text-sm font-medium text-navy">Kết Quả</p>
          </Link>
          <Link
            to="/student/profile"
            className="p-4 bg-cream-dark hover:bg-primary/5 rounded-xl border border-gold/20 transition-colors text-center"
          >
            <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-body text-sm font-medium text-navy">Hồ Sơ</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function StudentDashboard() {
  return (
    <RoleGuard allowedRoles={['student']}>
      <PermissionGuard requiredCapabilities={['attendance:view']}>
        <StudentDashboardContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
