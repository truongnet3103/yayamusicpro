/**
 * Student Assignments Page
 *
 * View own assignments
 * School-scoped and respects multi-tenancy
 */

import { FileText, Calendar, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { DashboardSkeleton } from '../../shared/components/LoadingSkeleton';
import { useTenant } from '../../shared/contexts/TenantContext';

function StudentAssignmentsPageContent() {
  const { profile } = useUser();
  const { school } = useTenant();
  const schoolId = school?.id || profile?.school_id;
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!profile || !schoolId) {
      setLoading(false);
      return;
    }

    const loadAssignments = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual assignments API call
        // GET /assignments?student_id={profile.id}&school_id={schoolId}

        // Placeholder data structure
        const placeholderAssignments: any[] = [];
        setAssignments(placeholderAssignments);
      } catch (error) {
        console.error('Error loading assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, [profile, schoolId, filterStatus]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const filteredAssignments = filterStatus === 'all'
    ? assignments
    : assignments.filter(a => a.status === filterStatus);

  const filterTabs = [
    { key: 'all', label: 'Tất cả', count: assignments.length },
    { key: 'pending', label: 'Chưa nộp', count: assignments.filter(a => a.status === 'pending').length },
    { key: 'completed', label: 'Đã hoàn thành', count: assignments.filter(a => a.status === 'completed').length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Bài Tập Luyện</h1>
        <p className="font-body text-charcoal/70">Xem và quản lý bài tập của bạn</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-gold/20">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-2.5 font-body text-sm font-medium border-b-2 transition-colors ${
              filterStatus === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-charcoal/60 hover:text-navy'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gold/20 shadow-card p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary/40" />
            </div>
            <h3 className="font-display text-lg font-semibold text-navy mb-2">Chưa Có Bài Tập</h3>
            <p className="font-body text-charcoal/60">
              {filterStatus === 'all'
                ? 'Bạn chưa có bài tập nào.'
                : filterStatus === 'pending'
                ? 'Bạn chưa có bài tập cần nộp.'
                : 'Bạn chưa có bài tập đã hoàn thành.'}
            </p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => (
            <Link
              key={assignment.id}
              to={`/student/assignments/${assignment.id}`}
              className="block bg-white rounded-xl border border-gold/20 shadow-card p-6 hover:shadow-elegant transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-body text-lg font-semibold text-navy">{assignment.title}</h3>
                    {assignment.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="font-body text-sm text-charcoal/60 mb-3">{assignment.description}</p>
                  <div className="flex flex-wrap items-center gap-4 font-body text-sm text-charcoal/60">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {assignment.class_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Hạn: {new Date(assignment.due_date).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {assignment.due_date && new Date(assignment.due_date) < new Date() && assignment.status !== 'completed' && (
                    <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-body font-medium rounded-full">
                      Quá hạn
                    </span>
                  )}
                  {assignment.status === 'pending' && (
                    <Clock className="w-5 h-5 text-gold-dark" />
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export function StudentAssignmentsPage() {
  return (
    <RoleGuard allowedRoles={['student']}>
      <PermissionGuard requiredCapabilities={['classes:read']}>
        <StudentAssignmentsPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
