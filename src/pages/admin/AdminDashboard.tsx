/**
 * School Admin Dashboard
 *
 * Role: Admin (school-scoped)
 *
 * TODO: Backend must validate:
 * - User has 'admin:view' capability
 * - User's school_id matches requested school_id
 * - All data is filtered by school_id
 */

import { Users, School, BookOpen, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { useTenant } from '../../shared/contexts/TenantContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { useSchoolOverview } from '../../domains/academic/hooks/useSchoolOverview';
import { useAttendanceSummary } from '../../domains/academic/hooks/useAttendanceSummary';
import { DashboardSkeleton } from '../../shared/components/LoadingSkeleton';
import { Link } from 'react-router-dom';

function AdminDashboardContent() {
  const { profile } = useUser();
  const { school } = useTenant();
  const { data: overview, loading: overviewLoading } = useSchoolOverview();
  const { data: attendance, loading: attendanceLoading } = useAttendanceSummary();

  const loading = overviewLoading || attendanceLoading;

  const stats = [
    {
      icon: Users,
      label: 'Học viên',
      value: overview?.student_count?.toString() || '0',
      change: '+0',
      color: 'bg-primary/10 text-primary',
      link: '/admin/users?type=student',
    },
    {
      icon: School,
      label: 'Giảng viên',
      value: overview?.teacher_count?.toString() || '0',
      change: '+0',
      color: 'bg-gold/20 text-gold',
      link: '/admin/users?type=teacher',
    },
    {
      icon: BookOpen,
      label: 'Lớp học',
      value: overview?.class_count?.toString() || '0',
      change: '+0',
      color: 'bg-navy/10 text-navy',
      link: '/admin/classes',
    },
    {
      icon: TrendingUp,
      label: 'Tỷ lệ điểm danh',
      value: attendance?.week.rate ? `${attendance.week.rate}%` : '0%',
      change: attendance?.week.rate ? `+${attendance.week.rate}%` : '+0%',
      color: 'bg-green-100 text-green-700',
      link: '/admin/reports',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'down':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-cream border-gold/20 text-charcoal';
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy font-display">Tổng Quan Trung Tâm</h1>
        <p className="text-charcoal/60 font-body text-sm mt-1">
          Xin chào, {profile?.first_name}! {school?.name && `Đang quản lý ${school.name}`}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const StatCard = (
            <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6 hover:shadow-elegant transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-green-600 font-body">{stat.change}</span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-charcoal/60 font-body">{stat.label}</h3>
                <p className="text-2xl font-bold text-navy font-display mt-1">{stat.value}</p>
              </div>
            </div>
          );

          return stat.link ? (
            <Link key={stat.label} to={stat.link} className="block">
              {StatCard}
            </Link>
          ) : (
            <div key={stat.label}>{StatCard}</div>
          );
        })}
      </div>

      {/* Attendance Summary */}
      {attendance && (
        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <h2 className="text-lg font-semibold text-navy font-display mb-4">Tóm Tắt Điểm Danh</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-cream rounded-lg p-3">
              <p className="text-xs text-charcoal/60 font-body">Hôm nay — Có mặt</p>
              <p className="text-2xl font-bold text-green-600 font-display mt-1">{attendance.today.present}</p>
            </div>
            <div className="bg-cream rounded-lg p-3">
              <p className="text-xs text-charcoal/60 font-body">Hôm nay — Vắng mặt</p>
              <p className="text-2xl font-bold text-red-500 font-display mt-1">{attendance.today.absent}</p>
            </div>
            <div className="bg-cream rounded-lg p-3">
              <p className="text-xs text-charcoal/60 font-body">Tuần này — Tỷ lệ</p>
              <p className="text-2xl font-bold text-primary font-display mt-1">{attendance.week.rate}%</p>
            </div>
            <div className="bg-cream rounded-lg p-3">
              <p className="text-xs text-charcoal/60 font-body">Tuần này — Tổng</p>
              <p className="text-2xl font-bold text-navy font-display mt-1">{attendance.week.total}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy font-display">Hoạt Động Gần Đây</h2>
          </div>
          <div className="space-y-4">
            {overview?.recent_activity && overview.recent_activity.length > 0 ? (
              overview.recent_activity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-charcoal font-body">{activity.message}</p>
                    <p className="text-xs text-charcoal/40 font-body mt-0.5">
                      {new Date(activity.timestamp).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-charcoal/50 font-body text-center py-4">Chưa có hoạt động nào</p>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <h2 className="text-lg font-semibold text-navy font-display mb-4">Trạng Thái Hệ Thống</h2>
          <div className="space-y-4">
            {overview?.system_status && (
              <div className={`p-4 rounded-lg border ${getStatusColor(overview.system_status.status)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {overview.system_status.status === 'operational' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span className="font-medium font-body capitalize">{overview.system_status.status}</span>
                </div>
                <p className="text-sm font-body">{overview.system_status.message}</p>
              </div>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-charcoal/60 font-body">Trạng thái API</span>
                <span className="text-green-600 font-medium font-body">Hoạt động</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal/60 font-body">Cơ sở dữ liệu</span>
                <span className="text-green-600 font-medium font-body">Đã kết nối</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal/60 font-body">Sao lưu lần cuối</span>
                <span className="text-charcoal font-body">
                  {new Date().toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
        <h2 className="text-lg font-semibold text-navy font-display mb-4">Thao Tác Nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="p-4 bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/20 transition-colors text-center group"
          >
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-navy font-body">Quản lý người dùng</p>
          </Link>
          <Link
            to="/admin/classes"
            className="p-4 bg-navy/5 hover:bg-navy/10 rounded-xl border border-navy/20 transition-colors text-center"
          >
            <BookOpen className="w-6 h-6 text-navy mx-auto mb-2" />
            <p className="text-sm font-medium text-navy font-body">Quản lý lớp học</p>
          </Link>
          <Link
            to="/admin/settings"
            className="p-4 bg-gold/10 hover:bg-gold/20 rounded-xl border border-gold/30 transition-colors text-center"
          >
            <School className="w-6 h-6 text-gold mx-auto mb-2" />
            <p className="text-sm font-medium text-navy font-body">Cài đặt trung tâm</p>
          </Link>
          <Link
            to="/admin/reports"
            className="p-4 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors text-center"
          >
            <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-navy font-body">Xem báo cáo</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  return (
    <RoleGuard allowedRoles={['admin', 'staff']}>
      <PermissionGuard requiredCapabilities={['admin:view']}>
        <AdminDashboardContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
