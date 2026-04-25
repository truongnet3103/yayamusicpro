import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { supabase } from '../../shared/lib/supabase';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { ClassSessionClaim, ClassSession } from '../../domains/academic/components/sessions/ClassSessionClaim';

interface TeacherClass {
  id: string;
  name: string;
  schedule_days: string[] | null;
  start_time: string | null;
  end_time: string | null;
  room: string | null;
  courses: { name: string } | null;
}

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function getWeekBounds(offset: number): { weekStart: Date; weekEnd: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + offset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { weekStart: monday, weekEnd: sunday };
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function TeacherScheduleContent() {
  const { profile } = useUser();
  const [weekOffset, setWeekOffset] = useState(0);
  const [teacherDbId, setTeacherDbId] = useState<string | null>(null);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  const { weekStart, weekEnd } = getWeekBounds(weekOffset);

  const loadSessions = useCallback(async (tid: string) => {
    const { data } = await supabase
      .from('class_sessions')
      .select('id, class_id, teacher_id, session_date, start_time, end_time, status, claimed_at, claim_notes, verified_at, classes(name)')
      .eq('teacher_id', tid)
      .gte('session_date', toISO(weekStart))
      .lte('session_date', toISO(weekEnd));

    setSessions(
      ((data ?? []) as any[]).map(s => ({
        ...s,
        class_name: s.classes?.name ?? undefined,
      }))
    );
  }, [weekStart.toISOString(), weekEnd.toISOString()]);

  useEffect(() => {
    if (!profile?.id) return;
    const init = async () => {
      setLoading(true);
      const { data: teacherRow } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (!teacherRow) { setLoading(false); return; }

      const tid = teacherRow.id;
      setTeacherDbId(tid);

      const { data: classData } = await supabase
        .from('classes')
        .select('id, name, schedule_days, start_time, end_time, room, courses(name)')
        .eq('teacher_id', tid)
        .eq('status', 'active');

      setClasses((classData ?? []) as TeacherClass[]);
      await loadSessions(tid);
      setLoading(false);
    };
    init();
  }, [profile?.id]);

  useEffect(() => {
    if (teacherDbId) loadSessions(teacherDbId);
  }, [weekOffset, teacherDbId]);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const sessionsByDate = sessions.reduce<Record<string, ClassSession[]>>((acc, s) => {
    const key = s.session_date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const classScheduleForDay = (dayIndex: number): TeacherClass[] => {
    const dayKey = DAY_KEYS[dayIndex];
    return classes.filter(c => Array.isArray(c.schedule_days) && c.schedule_days.includes(dayKey));
  };

  const today = toISO(new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy font-display">Lịch Dạy</h1>
          <p className="text-charcoal/60 font-body text-sm mt-1">
            {weekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
            {' – '}
            {weekEnd.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="p-2 rounded-lg border border-gold/30 hover:bg-cream text-charcoal/60 hover:text-charcoal transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-1.5 text-xs font-body font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
          >
            Tuần này
          </button>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="p-2 rounded-lg border border-gold/30 hover:bg-cream text-charcoal/60 hover:text-charcoal transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : !teacherDbId ? (
        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-12 text-center">
          <Calendar className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
          <p className="text-charcoal/50 font-body">Chưa có hồ sơ giảng viên</p>
        </div>
      ) : (
        <>
          {/* Weekly grid */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
              const dateStr = toISO(day);
              const isToday = dateStr === today;
              const daySessions = sessionsByDate[dateStr] ?? [];
              const dayClasses = classScheduleForDay(i);

              return (
                <div key={dateStr} className={`rounded-xl border ${isToday ? 'border-primary/40 bg-primary/5' : 'border-gold/20 bg-white'} p-2 min-h-[120px]`}>
                  <div className={`text-center mb-2 pb-2 border-b ${isToday ? 'border-primary/20' : 'border-gold/10'}`}>
                    <p className={`text-xs font-semibold font-body ${isToday ? 'text-primary' : 'text-charcoal/50'}`}>{DAY_LABELS[i]}</p>
                    <p className={`text-base font-bold font-display ${isToday ? 'text-primary' : 'text-navy'}`}>
                      {day.getDate()}
                    </p>
                  </div>

                  <div className="space-y-1">
                    {daySessions.length > 0 ? (
                      daySessions.map(s => (
                        <ClassSessionClaim
                          key={s.id}
                          session={s}
                          teacherDbId={teacherDbId}
                          onUpdated={() => loadSessions(teacherDbId)}
                          compact
                        />
                      ))
                    ) : dayClasses.length > 0 ? (
                      dayClasses.map(c => (
                        <div key={c.id} className="bg-gold/10 rounded-lg p-1.5">
                          <p className="text-xs font-semibold text-navy font-body truncate">{c.name}</p>
                          {c.start_time && (
                            <p className="text-xs text-charcoal/50 font-body flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {c.start_time.slice(0, 5)}
                            </p>
                          )}
                        </div>
                      ))
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Class list below */}
          {classes.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-navy font-display mb-3">Lớp được phân công</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {classes.map(c => (
                  <div key={c.id} className="bg-white rounded-xl border border-gold/20 shadow-card p-4 flex gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg self-start">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy font-body">{c.name}</p>
                      {c.courses && <p className="text-xs text-charcoal/50 font-body">{c.courses.name}</p>}
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {c.start_time && (
                          <span className="inline-flex items-center gap-1 text-xs text-charcoal/60 font-body">
                            <Clock className="w-3 h-3" />
                            {c.start_time.slice(0, 5)}{c.end_time ? ` – ${c.end_time.slice(0, 5)}` : ''}
                          </span>
                        )}
                        {c.room && (
                          <span className="inline-flex items-center gap-1 text-xs text-charcoal/60 font-body">
                            <MapPin className="w-3 h-3" />
                            {c.room}
                          </span>
                        )}
                      </div>
                      {c.schedule_days && c.schedule_days.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {c.schedule_days.map(d => {
                            const idx = DAY_KEYS.indexOf(d);
                            return idx >= 0 ? (
                              <span key={d} className="text-xs px-1.5 py-0.5 bg-gold/10 text-gold rounded font-body">
                                {DAY_LABELS[idx]}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sessions for this week - full claim view */}
          {sessions.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-navy font-display mb-3">Buổi dạy tuần này</h2>
              <div className="space-y-3">
                {sessions.map(s => (
                  <ClassSessionClaim
                    key={s.id}
                    session={s}
                    teacherDbId={teacherDbId}
                    onUpdated={() => loadSessions(teacherDbId)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function TeacherSchedulePage() {
  return (
    <RoleGuard allowedRoles={['teacher']}>
      <TeacherScheduleContent />
    </RoleGuard>
  );
}
