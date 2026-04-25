/**
 * Student Schedule Page
 *
 * View own class schedule
 * School-scoped and respects multi-tenancy
 */

import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { DashboardSkeleton } from '../../shared/components/LoadingSkeleton';
import { useTenant } from '../../shared/contexts/TenantContext';

function StudentSchedulePageContent() {
  const { profile } = useUser();
  const { school } = useTenant();
  const schoolId = school?.id || profile?.school_id;
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!profile || !schoolId) {
      setLoading(false);
      return;
    }

    const loadSchedule = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual schedule API call
        // GET /schedule?student_id={profile.id}&school_id={schoolId}&date={selectedDate}

        // Placeholder data structure
        const placeholderSchedule: any[] = [];
        setSchedule(placeholderSchedule);
      } catch (error) {
        console.error('Error loading schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [profile, schoolId, selectedDate]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const todaySchedule = schedule.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate.toDateString() === selectedDate.toDateString();
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Lịch Học</h1>
        <p className="font-body text-charcoal/70">Xem lịch học của bạn</p>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-xl border border-gold/20 shadow-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="font-body text-sm font-medium text-charcoal/70">Ngày:</label>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-3 py-2 border border-gold/40 rounded-lg font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-4 py-2 bg-primary text-white font-body text-sm font-semibold rounded-lg hover:bg-primary-light transition-colors"
          >
            Hôm nay
          </button>
        </div>
      </div>

      {/* Schedule List */}
      <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
        <h2 className="font-display text-lg font-semibold text-navy mb-4">
          {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h2>

        {todaySchedule.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-charcoal/20" />
            <p className="font-body text-charcoal/50">Ngày này không có lịch học</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todaySchedule.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 bg-cream-dark rounded-xl border border-gold/10 hover:bg-primary/5 transition-colors"
              >
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-body font-semibold text-navy mb-1">{item.class_name}</h3>
                  <div className="flex flex-wrap items-center gap-4 font-body text-sm text-charcoal/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {item.start_time} - {item.end_time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {item.room}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {item.teacher_name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly View (Future Enhancement) */}
      <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
        <h2 className="font-display text-lg font-semibold text-navy mb-4">Lịch Theo Tuần</h2>
        <p className="font-body text-sm text-charcoal/60">
          Lịch học theo tuần đang được phát triển. Hiện tại hãy dùng bộ chọn ngày ở trên để xem lịch theo từng ngày.
        </p>
      </div>
    </div>
  );
}

export function StudentSchedulePage() {
  return (
    <RoleGuard allowedRoles={['student']}>
      <PermissionGuard requiredCapabilities={['classes:read']}>
        <StudentSchedulePageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
