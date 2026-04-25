/**
 * Student Classes Page
 *
 * View enrolled classes
 * School-scoped and respects multi-tenancy
 */

import { BookOpen, User, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { DashboardSkeleton } from '../../shared/components/LoadingSkeleton';
import { supabase } from '../../shared/lib/supabase';
import { useTenant } from '../../shared/contexts/TenantContext';

function StudentClassesPageContent() {
  const { profile } = useUser();
  const { school } = useTenant();
  const schoolId = school?.id || profile?.school_id;
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    if (!profile || !schoolId) {
      setLoading(false);
      return;
    }

    const loadClasses = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual classes API call
        // GET /classes?student_id={profile.id}&school_id={schoolId}

        // Placeholder: Fetch from class_enrollments
        const { data: enrollments, error } = await supabase
          .from('class_enrollments')
          .select(`
            id,
            class_id,
            classes (
              id,
              name,
              subject,
              section,
              schedule,
              teachers (
                id,
                first_name,
                last_name
              )
            )
          `)
          .eq('student_id', profile.id)
          .eq('school_id', schoolId);

        if (error) {
          console.error('Error loading classes:', error);
          setClasses([]);
        } else {
          const formattedClasses = enrollments?.map(enrollment => {
            const classData = Array.isArray(enrollment.classes) ? enrollment.classes[0] : enrollment.classes;
            const teacher = Array.isArray(classData?.teachers) ? classData?.teachers[0] : classData?.teachers;
            return {
              id: classData?.id,
              enrollmentId: enrollment.id,
              name: classData?.name,
              subject: classData?.subject,
              section: classData?.section,
              schedule: classData?.schedule,
              teacher: teacher
                ? `${teacher.first_name} ${teacher.last_name}`
                : 'TBA',
            };
          }).filter(c => c.id) || [];
          setClasses(formattedClasses);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, [profile, schoolId]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Lớp Đã Đăng Ký</h1>
        <p className="font-body text-charcoal/70">Xem các lớp học bạn đang tham gia</p>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-12 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-primary/40" />
          </div>
          <h3 className="font-display text-lg font-semibold text-navy mb-2">Chưa Đăng Ký Lớp Nào</h3>
          <p className="font-body text-charcoal/60">Bạn chưa được đăng ký vào lớp học nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Link
              key={classItem.id}
              to={`/student/classes/${classItem.id}`}
              className="block bg-white rounded-xl border border-gold/20 shadow-card p-6 hover:shadow-elegant transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-body font-semibold text-navy mb-1 truncate">{classItem.name}</h3>
                  <p className="font-body text-sm text-charcoal/60">{classItem.subject}</p>
                  {classItem.section && (
                    <p className="font-body text-xs text-charcoal/40 mt-1">Nhóm {classItem.section}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-body text-sm text-charcoal/60">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{classItem.teacher}</span>
                </div>
                {classItem.schedule && (
                  <div className="flex items-center gap-2 font-body text-sm text-charcoal/60">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{classItem.schedule}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gold/20">
                <span className="font-body text-xs text-primary font-medium">Xem chi tiết →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function StudentClassesPage() {
  return (
    <RoleGuard allowedRoles={['student']}>
      <PermissionGuard requiredCapabilities={['classes:read']}>
        <StudentClassesPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
