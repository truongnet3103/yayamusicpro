import { Users, CheckCircle, XCircle, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { supabase } from '../../shared/lib/supabase';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string | null;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string | null;
  class_name: string | null;
}

const STATUS_CONFIG = {
  present: { label: 'Có mặt', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle },
  absent: { label: 'Vắng', color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
  late: { label: 'Trễ', color: 'text-gold bg-gold/10 border-gold/30', icon: Clock },
  excused: { label: 'Có phép', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckCircle },
};

function ParentAttendanceContent() {
  const { profile } = useUser();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);

  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
    .toISOString().slice(0, 10);
  const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0)
    .toISOString().slice(0, 10);
  const monthLabel = targetDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  useEffect(() => {
    if (!profile?.id) return;

    const loadChildren = async () => {
      setLoadingChildren(true);

      const { data: parentRow } = await supabase
        .from('parents')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (!parentRow) { setLoadingChildren(false); return; }

      const { data: links } = await supabase
        .from('student_parents')
        .select('students(id, first_name, last_name, grade_level)')
        .eq('parent_id', parentRow.id);

      const kids: Child[] = ((links ?? []) as any[])
        .map(l => l.students)
        .filter(Boolean)
        .map((s: any) => ({
          id: s.id,
          first_name: s.first_name,
          last_name: s.last_name,
          grade_level: s.grade_level ?? null,
        }));

      setChildren(kids);
      if (kids.length === 1) setSelectedChild(kids[0]);
      setLoadingChildren(false);
    };

    loadChildren();
  }, [profile?.id]);

  useEffect(() => {
    if (!selectedChild) { setRecords([]); return; }

    const loadRecords = async () => {
      setLoadingRecords(true);

      const { data } = await supabase
        .from('attendance_records')
        .select('id, date, status, notes, classes(name)')
        .eq('student_id', selectedChild.id)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date', { ascending: false });

      setRecords(
        ((data ?? []) as any[]).map(r => ({
          id: r.id,
          date: r.date,
          status: r.status as AttendanceRecord['status'],
          notes: r.notes ?? null,
          class_name: r.classes?.name ?? null,
        }))
      );
      setLoadingRecords(false);
    };

    loadRecords();
  }, [selectedChild?.id, monthStart, monthEnd]);

  const summary = records.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      acc.total++;
      return acc;
    },
    { total: 0, present: 0, absent: 0, late: 0, excused: 0 } as Record<string, number>
  );

  if (loadingChildren) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy font-display">Theo Dõi Điểm Danh</h1>
        <p className="text-charcoal/60 font-body text-sm mt-1">Xem lịch sử điểm danh của con em</p>
      </div>

      {children.length === 0 ? (
        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-12 text-center">
          <Users className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-navy font-display mb-2">Chưa Liên Kết Học Viên</h3>
          <p className="text-charcoal/60 font-body text-sm">Liên hệ quản trị viên trung tâm để liên kết tài khoản học viên.</p>
        </div>
      ) : (
        <>
          {/* Child selector — show when more than one child */}
          {children.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-body font-medium transition-colors ${
                    selectedChild?.id === child.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-charcoal border-gold/30 hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-current/10 flex items-center justify-center text-xs font-bold">
                    {child.first_name[0]}
                  </span>
                  {child.first_name} {child.last_name}
                </button>
              ))}
            </div>
          )}

          {selectedChild ? (
            <>
              {/* Month navigation */}
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-navy font-display capitalize">{monthLabel}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMonthOffset(m => m - 1)}
                    className="p-2 rounded-lg border border-gold/30 hover:bg-cream text-charcoal/60 hover:text-charcoal transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMonthOffset(0)}
                    className="px-3 py-1.5 text-xs font-body font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                    disabled={monthOffset === 0}
                  >
                    Tháng này
                  </button>
                  <button
                    onClick={() => setMonthOffset(m => m + 1)}
                    disabled={monthOffset >= 0}
                    className="p-2 rounded-lg border border-gold/30 hover:bg-cream text-charcoal/60 hover:text-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Summary cards */}
              {!loadingRecords && summary.total > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'present', label: 'Có mặt', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
                    { key: 'absent', label: 'Vắng', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
                    { key: 'late', label: 'Trễ', color: 'text-gold', bg: 'bg-gold/10 border-gold/30' },
                    { key: 'excused', label: 'Có phép', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
                  ].map(stat => (
                    <div key={stat.key} className={`rounded-xl border p-4 ${stat.bg}`}>
                      <p className={`text-2xl font-bold font-display ${stat.color}`}>{summary[stat.key] ?? 0}</p>
                      <p className={`text-xs font-body mt-0.5 ${stat.color}/80`}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Records list */}
              {loadingRecords ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : records.length === 0 ? (
                <div className="bg-white rounded-xl border border-gold/20 shadow-card p-12 text-center">
                  <Calendar className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
                  <p className="text-charcoal/50 font-body text-sm">Không có buổi học nào trong tháng này</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gold/20 shadow-card overflow-hidden">
                  <div className="divide-y divide-gold/10">
                    {records.map(r => {
                      const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.absent;
                      const Icon = cfg.icon;
                      return (
                        <div key={r.id} className="px-5 py-3.5 flex items-center gap-4">
                          <div className="text-center min-w-[48px]">
                            <p className="text-lg font-bold text-navy font-display leading-none">
                              {new Date(r.date + 'T00:00:00').getDate()}
                            </p>
                            <p className="text-xs text-charcoal/50 font-body mt-0.5">
                              {new Date(r.date + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'short' })}
                            </p>
                          </div>
                          <div className="flex-1 min-w-0">
                            {r.class_name && (
                              <p className="text-sm font-semibold text-navy font-body">{r.class_name}</p>
                            )}
                            {r.notes && (
                              <p className="text-xs text-charcoal/50 font-body mt-0.5 truncate">{r.notes}</p>
                            )}
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium font-body border ${cfg.color}`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gold/20 shadow-card p-12 text-center">
              <Users className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
              <p className="text-charcoal/50 font-body text-sm">Chọn học viên để xem điểm danh</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function ParentAttendancePage() {
  return (
    <RoleGuard allowedRoles={['parent']}>
      <PermissionGuard requiredCapabilities={['attendance:view']}>
        <ParentAttendanceContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
