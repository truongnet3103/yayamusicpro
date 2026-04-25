/**
 * Student Attendance Page
 *
 * View own attendance records
 * School-scoped and respects multi-tenancy
 */

import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { StudentAttendanceView } from '../../domains/academic/components/attendance/StudentAttendanceView';
import { DashboardSkeleton } from '../../shared/components/LoadingSkeleton';

function StudentAttendancePageContent() {
  const { profile } = useUser();

  if (!profile) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Điểm Danh Của Tôi</h1>
        <p className="font-body text-charcoal/70">Xem lịch sử điểm danh của bạn</p>
      </div>

      <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
        <StudentAttendanceView
          studentId={profile.id}
          studentName={profile.full_name || `${profile.first_name} ${profile.last_name}`}
          viewMode="student"
        />
      </div>
    </div>
  );
}

export function StudentAttendancePage() {
  return (
    <RoleGuard allowedRoles={['student']}>
      <PermissionGuard requiredCapabilities={['attendance:view']}>
        <StudentAttendancePageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
