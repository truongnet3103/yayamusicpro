import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Save, Calendar, Users } from 'lucide-react';
import { supabase } from '../../../../shared/lib/supabase';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface StudentRow {
  student_id: string;
  student_name: string;
  student_code: string;
  existing_id: string | null;
  status: AttendanceStatus | null;
}

interface TeacherAttendanceMarkingProps {
  classId: string;
  className: string;
}

export function TeacherAttendanceMarking({ classId, className }: TeacherAttendanceMarkingProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [changes, setChanges] = useState<Map<string, AttendanceStatus>>(new Map());

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    setChanges(new Map());

    try {
      // 0. Lấy school_id từ class (cần cho INSERT attendance_records)
      const { data: classRow } = await supabase
        .from('classes')
        .select('school_id')
        .eq('id', classId)
        .single();
      if (classRow?.school_id) setSchoolId(classRow.school_id);

      // 1. Load enrolled students
      const { data: enr, error: enrErr } = await supabase
        .from('enrollments')
        .select('student_id, students(id, first_name, last_name, student_code)')
        .eq('class_id', classId)
        .eq('status', 'active');

      if (enrErr) throw enrErr;

      const studentList = (enr ?? [])
        .filter((e: any) => e.students)
        .map((e: any) => {
          const s = e.students;
          return {
            student_id: s.id,
            student_name: `${s.first_name} ${s.last_name}`,
            student_code: s.student_code ?? '',
            existing_id: null as string | null,
            status: null as AttendanceStatus | null,
          };
        });

      if (studentList.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // 2. Load existing attendance for selected date
      const studentIds = studentList.map(s => s.student_id);
      const { data: att, error: attErr } = await supabase
        .from('attendance_records')
        .select('id, student_id, status')
        .eq('class_id', classId)
        .eq('attendance_date', date)
        .in('student_id', studentIds);

      if (attErr) throw attErr;

      const attMap: Record<string, { id: string; status: AttendanceStatus }> = {};
      (att ?? []).forEach((r: any) => {
        attMap[r.student_id] = { id: r.id, status: r.status };
      });

      setStudents(studentList.map(s => ({
        ...s,
        existing_id: attMap[s.student_id]?.id ?? null,
        status: attMap[s.student_id]?.status ?? null,
      })));
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải dữ liệu điểm danh');
    } finally {
      setLoading(false);
    }
  }, [classId, date]);

  useEffect(() => { loadAttendance(); }, [loadAttendance]);

  function handleStatusChange(studentId: string, status: AttendanceStatus) {
    setChanges(prev => new Map(prev).set(studentId, status));
    setSuccessMessage(null);
  }

  function handleQuickMarkAll(status: AttendanceStatus) {
    const newChanges = new Map<string, AttendanceStatus>();
    students.forEach(s => newChanges.set(s.student_id, status));
    setChanges(newChanges);
    setSuccessMessage(null);
  }

  async function handleSave() {
    if (changes.size === 0) {
      setError('Chưa có thay đổi nào để lưu');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const existingMap: Record<string, string> = {};
      students.forEach(s => { if (s.existing_id) existingMap[s.student_id] = s.existing_id; });

      const toUpsert: any[] = [];
      changes.forEach((status, studentId) => {
        const existingId = existingMap[studentId];
        const base = {
          class_id: classId,
          school_id: schoolId,
          student_id: studentId,
          attendance_date: date,
          status,
        };
        if (existingId) {
          toUpsert.push({ id: existingId, ...base });
        } else {
          toUpsert.push(base);
        }
      });

      const { error: upsertErr } = await supabase
        .from('attendance_records')
        .upsert(toUpsert, { onConflict: 'class_id,student_id,attendance_date' });

      if (upsertErr) throw upsertErr;

      setSuccessMessage(`Đã lưu điểm danh cho ${toUpsert.length} học viên`);
      await loadAttendance();
    } catch (err: any) {
      setError(err?.message ?? 'Không thể lưu điểm danh');
    } finally {
      setSaving(false);
    }
  }

  function getDisplayStatus(student: StudentRow): AttendanceStatus | null {
    return changes.get(student.student_id) ?? student.status ?? null;
  }

  const statusConfig = {
    present:  { icon: CheckCircle, label: 'Có mặt',  color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-600'  },
    absent:   { icon: XCircle,     label: 'Vắng mặt', color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-600'    },
    late:     { icon: Clock,       label: 'Đi trễ',   color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-600' },
    excused:  { icon: AlertCircle, label: 'Có phép',  color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-600'   },
  };

  const summary = students.reduce((acc, s) => {
    const st = getDisplayStatus(s);
    if (st) acc[st] = (acc[st] || 0) + 1;
    else acc.unmarked = (acc.unmarked || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-navy font-display">Ghi Nhận Điểm Danh</h2>
            <p className="text-charcoal/60 font-body text-sm mt-1">{className}</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-charcoal/40" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="px-3 py-2 border border-gold/40 rounded-lg bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 font-body text-sm">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 font-body text-sm">{successMessage}</p>
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-cream rounded-xl p-4 border border-gold/20">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-charcoal/50" />
              <span className="text-xs text-charcoal/60 font-body">Tổng</span>
            </div>
            <p className="text-2xl font-bold text-navy font-display">{students.length}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700 font-body">Có mặt</span>
            </div>
            <p className="text-2xl font-bold text-green-700 font-display">{summary.present || 0}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs text-red-700 font-body">Vắng mặt</span>
            </div>
            <p className="text-2xl font-bold text-red-700 font-display">{summary.absent || 0}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-xs text-yellow-700 font-body">Đi trễ</span>
            </div>
            <p className="text-2xl font-bold text-yellow-700 font-display">{summary.late || 0}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-700 font-body">Có phép</span>
            </div>
            <p className="text-2xl font-bold text-blue-700 font-display">{summary.excused || 0}</p>
          </div>
        </div>

        {/* Quick mark all */}
        <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-gold/20">
          <span className="text-sm font-medium text-charcoal/70 font-body self-center">Đánh dấu tất cả:</span>
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={status}
                onClick={() => handleQuickMarkAll(status as AttendanceStatus)}
                className={`px-4 py-2 rounded-lg border-2 ${config.bg} ${config.border} ${config.color} font-semibold font-body text-sm hover:opacity-80 transition-opacity flex items-center gap-2`}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Student list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {students.map(student => {
              const currentStatus = getDisplayStatus(student);
              const hasChange = changes.has(student.student_id);
              return (
                <div
                  key={student.student_id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    hasChange ? 'bg-primary/5 border-primary/30' : 'bg-cream border-gold/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/20 border-2 border-gold/30 flex items-center justify-center">
                      <span className="text-navy font-semibold font-display text-lg">
                        {student.student_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-navy font-body">{student.student_name}</p>
                      {student.student_code && (
                        <p className="text-xs text-charcoal/50 font-body">{student.student_code}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {Object.entries(statusConfig).map(([status, config]) => {
                      const Icon = config.icon;
                      const isSelected = currentStatus === status;
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(student.student_id, status as AttendanceStatus)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? `${config.bg} ${config.border} ${config.color}`
                              : 'bg-white border-gold/30 text-charcoal/30 hover:border-gold/60'
                          }`}
                          title={config.label}
                        >
                          <Icon className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && students.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-3 text-gold/30" />
            <p className="text-charcoal/50 font-body text-sm">Chưa có học viên nào trong lớp này</p>
          </div>
        )}

        {students.length > 0 && (
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gold/20">
            <button
              onClick={loadAttendance}
              disabled={saving}
              className="px-5 py-2.5 border border-gold/40 rounded-lg text-charcoal font-body text-sm hover:bg-cream disabled:opacity-50 transition-colors"
            >
              Đặt lại
            </button>
            <button
              onClick={handleSave}
              disabled={saving || changes.size === 0}
              className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-body font-semibold text-sm shadow-sm transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu điểm danh ({changes.size})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
