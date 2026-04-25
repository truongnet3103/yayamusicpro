/**
 * Student Grades Page
 *
 * View own grades
 * School-scoped and respects multi-tenancy
 */

import { Award, BookOpen, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { DashboardSkeleton } from '../../shared/components/LoadingSkeleton';
import { useTenant } from '../../shared/contexts/TenantContext';

function StudentGradesPageContent() {
  const { profile } = useUser();
  const { school } = useTenant();
  const schoolId = school?.id || profile?.school_id;
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<any[]>([]);
  const [filterClass, setFilterClass] = useState<string>('all');

  useEffect(() => {
    if (!profile || !schoolId) {
      setLoading(false);
      return;
    }

    const loadGrades = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual grades API call
        // GET /grades?student_id={profile.id}&school_id={schoolId}

        // Placeholder data structure
        const placeholderGrades: any[] = [];
        setGrades(placeholderGrades);
      } catch (error) {
        console.error('Error loading grades:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGrades();
  }, [profile, schoolId, filterClass]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Kết Quả Của Tôi</h1>
        <p className="font-body text-charcoal/70">Xem điểm số và tiến độ học tập</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-body text-sm text-charcoal/70">Điểm trung bình</p>
              <p className="font-display text-2xl font-bold text-navy">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-body text-sm text-charcoal/70">Số môn học</p>
              <p className="font-display text-2xl font-bold text-navy">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-gold-dark" />
            </div>
            <div>
              <p className="font-body text-sm text-charcoal/70">Xu hướng</p>
              <p className="font-display text-2xl font-bold text-navy">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-navy">Tất Cả Kết Quả</h2>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 border border-gold/40 rounded-lg font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          >
            <option value="all">Tất cả lớp học</option>
            {/* TODO: Add class options */}
          </select>
        </div>

        {grades.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-12 h-12 mx-auto mb-3 text-charcoal/20" />
            <p className="font-body text-charcoal/50">Chưa có kết quả nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/20">
                  <th className="text-left py-3 px-4 font-body text-sm font-semibold text-charcoal/70">Lớp học</th>
                  <th className="text-left py-3 px-4 font-body text-sm font-semibold text-charcoal/70">Bài kiểm tra</th>
                  <th className="text-left py-3 px-4 font-body text-sm font-semibold text-charcoal/70">Điểm</th>
                  <th className="text-left py-3 px-4 font-body text-sm font-semibold text-charcoal/70">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade.id} className="border-b border-gold/10 hover:bg-cream transition-colors">
                    <td className="py-3 px-4 font-body text-sm text-navy">{grade.class_name}</td>
                    <td className="py-3 px-4 font-body text-sm text-navy">{grade.assignment_name}</td>
                    <td className="py-3 px-4 font-display text-sm font-bold text-primary">{grade.grade}</td>
                    <td className="py-3 px-4 font-body text-sm text-charcoal/60">
                      {new Date(grade.date).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function StudentGradesPage() {
  return (
    <RoleGuard allowedRoles={['student']}>
      <PermissionGuard requiredCapabilities={['grading:read']}>
        <StudentGradesPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
