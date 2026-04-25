/**
 * Parent Grades Page
 *
 * View grades for all children (published only)
 * School-scoped and respects multi-tenancy
 */

import { Award, Users, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { useParentStudents } from '../../domains/academic/hooks/useParentStudents';
import { DashboardSkeleton } from '../../shared/components/LoadingSkeleton';

function ParentGradesPageContent() {
  useUser();
  const { data: students, loading: studentsLoading } = useParentStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // TODO: Fetch grades from API
  const grades: Array<{
    id: string;
    subject: string;
    grade: string;
    percentage: number;
    published: boolean;
    date: string;
  }> = [];

  if (studentsLoading) {
    return <DashboardSkeleton />;
  }

  if (students.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Kết Quả Học Tập</h1>
          <p className="font-body text-charcoal/70">Xem kết quả học tập của con em</p>
        </div>
        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-12 text-center">
          <Users className="w-16 h-16 text-charcoal/20 mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold text-navy mb-2">Chưa Liên Kết Học Viên</h3>
          <p className="font-body text-charcoal/70">Chưa có học viên nào được liên kết với tài khoản.</p>
        </div>
      </div>
    );
  }

  const publishedGrades = grades.filter(g => g.published);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Kết Quả Học Tập</h1>
        <p className="font-body text-charcoal/70">Xem kết quả học tập đã công bố của con em</p>
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

      {/* Grades Display */}
      <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
        <h2 className="font-display text-lg font-semibold text-navy mb-4">
          {selectedStudent ? `Kết quả của ${selectedStudent.full_name}` : 'Tất cả kết quả'}
        </h2>

        {publishedGrades.length === 0 ? (
          <div className="text-center py-12 text-charcoal/50">
            <Award className="w-12 h-12 mx-auto mb-3 text-charcoal/20" />
            <p className="font-body">Chưa có kết quả nào được công bố</p>
            <p className="font-body text-sm mt-2">Kết quả sẽ hiển thị ở đây khi giảng viên công bố</p>
          </div>
        ) : (
          <div className="space-y-3">
            {publishedGrades.map((grade) => (
              <div
                key={grade.id}
                className="flex items-center justify-between p-4 bg-cream-dark rounded-xl border border-gold/10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-body font-medium text-navy">{grade.subject}</h3>
                    <p className="font-body text-xs text-charcoal/50">{new Date(grade.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-display text-lg font-bold text-primary">{grade.grade}</span>
                  {grade.percentage && (
                    <p className="font-body text-xs text-charcoal/50">{grade.percentage}%</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ParentGradesPage() {
  return (
    <RoleGuard allowedRoles={['parent']}>
      <PermissionGuard requiredCapabilities={['students:view']}>
        <ParentGradesPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
