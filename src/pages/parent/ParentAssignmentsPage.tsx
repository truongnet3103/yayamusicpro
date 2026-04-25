/**
 * Parent Assignments Page
 *
 * View assignments for all children
 * School-scoped and respects multi-tenancy
 */

import { FileText, Users, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { useParentStudents } from '../../domains/academic/hooks/useParentStudents';
import { DashboardSkeleton } from '../../shared/components/LoadingSkeleton';

function ParentAssignmentsPageContent() {
  useUser();
  const { data: students, loading: studentsLoading } = useParentStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // TODO: Fetch assignments from API
  const assignments: Array<{
    id: string;
    student_id: string;
    title: string;
    subject: string;
    due_date: string;
    status: 'pending' | 'submitted' | 'graded';
  }> = [];

  if (studentsLoading) {
    return <DashboardSkeleton />;
  }

  if (students.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Bài Tập Luyện</h1>
          <p className="font-body text-charcoal/70">Xem bài tập của con em</p>
        </div>
        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-12 text-center">
          <Users className="w-16 h-16 text-charcoal/20 mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold text-navy mb-2">Chưa Liên Kết Học Viên</h3>
          <p className="font-body text-charcoal/70">Chưa có học viên nào được liên kết với tài khoản.</p>
        </div>
      </div>
    );
  }

  const filteredAssignments = selectedStudentId
    ? assignments.filter(a => a.student_id === selectedStudentId)
    : assignments;

  const statusLabel: Record<string, string> = {
    pending: 'Chưa nộp',
    submitted: 'Đã nộp',
    graded: 'Đã chấm',
  };

  const statusStyle: Record<string, string> = {
    graded: 'bg-primary/10 text-primary',
    submitted: 'bg-gold/10 text-gold-dark',
    pending: 'bg-charcoal/10 text-charcoal',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Bài Tập Luyện</h1>
        <p className="font-body text-charcoal/70">Xem bài tập của con em</p>
      </div>

      {students.length > 1 && (
        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
          <h2 className="font-display text-lg font-semibold text-navy mb-4">Chọn Học Viên</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(selectedStudentId === student.id ? null : student.id)}
                className={`p-4 rounded-xl border transition-colors text-left ${
                  selectedStudentId === student.id
                    ? 'bg-primary/5 border-primary/30'
                    : 'bg-cream-dark border-gold/20 hover:bg-primary/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  {student.avatar_url ? (
                    <img
                      src={student.avatar_url}
                      alt={student.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-display text-sm font-semibold text-primary">
                        {student.first_name[0]}{student.last_name[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-body font-medium text-navy">{student.full_name}</h3>
                    <p className="font-body text-xs text-charcoal/70">{student.grade}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Assignments Display */}
      <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
        <h2 className="font-display text-lg font-semibold text-navy mb-4">Tất Cả Bài Tập</h2>

        {filteredAssignments.length === 0 ? (
          <div className="text-center py-12 text-charcoal/50">
            <FileText className="w-12 h-12 mx-auto mb-3 text-charcoal/20" />
            <p className="font-body">Chưa có bài tập nào</p>
            <p className="font-body text-sm mt-2">Bài tập sẽ hiển thị ở đây khi giảng viên giao</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 bg-cream-dark rounded-xl border border-gold/10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-body font-medium text-navy">{assignment.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-charcoal/50 font-body">
                      <span>{assignment.subject}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Hạn: {new Date(assignment.due_date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 text-xs font-body font-medium rounded-full ${statusStyle[assignment.status] || 'bg-charcoal/10 text-charcoal'}`}>
                    {statusLabel[assignment.status] || assignment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ParentAssignmentsPage() {
  return (
    <RoleGuard allowedRoles={['parent']}>
      <PermissionGuard requiredCapabilities={['students:view']}>
        <ParentAssignmentsPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
