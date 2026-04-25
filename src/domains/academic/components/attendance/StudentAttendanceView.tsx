import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Calendar, TrendingUp, User } from 'lucide-react';
import { supabase } from '../../../../shared/lib/supabase';

interface StudentAttendanceViewProps {
  studentId: string;   // user_profiles.id (auth user id)
  studentName: string;
  viewMode: 'student' | 'parent';
}

interface AttendanceRow {
  id: string;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  check_in_time: string | null;
  notes: string | null;
  class_name: string;
}

export function StudentAttendanceView({ studentId, studentName, viewMode }: StudentAttendanceViewProps) {
  const [records, setRecords] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Resolve user_profiles.id → students.id
      const { data: studentRow, error: sErr } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', studentId)
        .single();

      if (sErr || !studentRow) {
        setRecords([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('attendance_records')
        .select('id, attendance_date, status, check_in_time, notes, classes(name)')
        .eq('student_id', studentRow.id)
        .order('attendance_date', { ascending: false });

      if (startDate) query = query.gte('attendance_date', startDate);
      if (endDate) query = query.lte('attendance_date', endDate);

      const { data, error: attErr } = await query;
      if (attErr) throw attErr;

      setRecords(
        (data ?? []).map((r: any) => ({
          id: r.id,
          attendance_date: r.attendance_date,
          status: r.status,
          check_in_time: r.check_in_time ?? null,
          notes: r.notes ?? null,
          class_name: r.classes?.name ?? '—',
        }))
      );
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải dữ liệu điểm danh');
    } finally {
      setLoading(false);
    }
  }, [studentId, startDate, endDate]);

  useEffect(() => { loadAttendance(); }, [loadAttendance]);

  const statusConfig = {
    present:  { icon: CheckCircle, label: 'Có mặt',   color: 'text-green-600',  bg: 'bg-green-100'  },
    absent:   { icon: XCircle,     label: 'Vắng mặt', color: 'text-red-600',    bg: 'bg-red-100'    },
    late:     { icon: Clock,       label: 'Đi trễ',   color: 'text-yellow-600', bg: 'bg-yellow-100' },
    excused:  { icon: AlertCircle, label: 'Có phép',  color: 'text-blue-600',   bg: 'bg-blue-100'   },
  };

  const summary = records.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; acc.total++; return acc; },
    { present: 0, absent: 0, late: 0, excused: 0, total: 0 }
  );
  const attendanceRate = summary.total > 0
    ? Math.round(((summary.present + summary.late) / summary.total) * 100)
    : 0;

  const getRateColor = (rate: number) =>
    rate >= 90 ? 'text-green-600' : rate >= 75 ? 'text-yellow-600' : 'text-red-600';

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatTime = (t: string | null) => {
    if (!t) return '';
    return new Date(`2000-01-01T${t}`).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const inputCls = 'w-full px-3 py-2 border border-gold/40 rounded-lg bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-navy font-display">
              {viewMode === 'parent' ? 'Điểm Danh Của Con' : 'Điểm Danh Của Tôi'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-4 h-4 text-charcoal/40" />
              <p className="text-charcoal/60 font-body text-sm">{studentName}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 font-body text-sm">{error}</p>
          </div>
        )}

        {/* Date filters */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="block text-xs font-medium text-charcoal/70 font-body mb-1.5">Từ ngày</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal/70 font-body mb-1.5">Đến ngày</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
          </div>
        </div>

        {/* Summary stats */}
        {records.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs text-primary font-body">Tỷ lệ</span>
              </div>
              <p className={`text-2xl font-bold font-display ${getRateColor(attendanceRate)}`}>{attendanceRate}%</p>
            </div>
            <div className="bg-cream rounded-xl p-4 border border-gold/20">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-charcoal/50" />
                <span className="text-xs text-charcoal/60 font-body">Tổng buổi</span>
              </div>
              <p className="text-2xl font-bold text-navy font-display">{summary.total}</p>
            </div>
            {(['present','absent','late','excused'] as const).map(st => {
              const cfg = statusConfig[st];
              const Icon = cfg.icon;
              return (
                <div key={st} className={`${cfg.bg} rounded-xl p-4 border border-${st === 'present' ? 'green' : st === 'absent' ? 'red' : st === 'late' ? 'yellow' : 'blue'}-200`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                    <span className={`text-xs font-body ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <p className={`text-2xl font-bold font-display ${cfg.color}`}>{summary[st]}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Records list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gold/30" />
            <p className="text-charcoal/50 font-body text-sm">Chưa có dữ liệu điểm danh</p>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-navy font-display mb-3">Lịch Sử Điểm Danh</h3>
            {records.map(record => {
              const cfg = statusConfig[record.status];
              const Icon = cfg.icon;
              return (
                <div key={record.id} className="flex items-center justify-between p-4 bg-cream rounded-xl border border-gold/20">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${cfg.bg}`}>
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-navy font-body">{record.class_name}</p>
                      <p className="text-xs text-charcoal/50 font-body">{formatDate(record.attendance_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {record.check_in_time && (
                      <span className="text-xs text-charcoal/40 font-body">Vào: {formatTime(record.check_in_time)}</span>
                    )}
                    <div className={`px-3 py-1.5 rounded-full ${cfg.bg} flex items-center gap-1.5`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                      <span className={`font-semibold font-body text-sm ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
