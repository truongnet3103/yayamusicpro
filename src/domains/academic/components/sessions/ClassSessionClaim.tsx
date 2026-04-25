import { BookOpen, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../../../shared/lib/supabase';

export interface ClassSession {
  id: string;
  class_id: string;
  teacher_id: string;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  status: 'scheduled' | 'claimed' | 'verified' | 'cancelled';
  claimed_at: string | null;
  claim_notes: string | null;
  verified_at: string | null;
  class_name?: string;
}

interface Props {
  session: ClassSession;
  teacherDbId: string;
  onUpdated: () => void;
  compact?: boolean;
}

const statusIcon = {
  scheduled: <Clock className="w-4 h-4 text-gold" />,
  claimed: <AlertCircle className="w-4 h-4 text-blue-600" />,
  verified: <CheckCircle className="w-4 h-4 text-green-600" />,
  cancelled: <XCircle className="w-4 h-4 text-red-500" />,
};

const statusLabel = {
  scheduled: 'Chưa xác nhận',
  claimed: 'Đã báo dạy',
  verified: 'Đã kiểm duyệt',
  cancelled: 'Đã huỷ',
};

const statusBg = {
  scheduled: 'bg-gold/20 text-gold border-gold/30',
  claimed: 'bg-blue-100 text-blue-700 border-blue-200',
  verified: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-500 border-red-200',
};

export function ClassSessionClaim({ session, teacherDbId, onUpdated, compact = false }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');

  const handleClaim = async () => {
    setClaiming(true);
    setError('');
    const { error: err } = await supabase
      .from('class_sessions')
      .update({
        status: 'claimed',
        claimed_at: new Date().toISOString(),
        claim_notes: notes.trim() || null,
      })
      .eq('id', session.id)
      .eq('teacher_id', teacherDbId);

    if (err) {
      setError(err.message);
      setClaiming(false);
      return;
    }
    setClaiming(false);
    setShowModal(false);
    setNotes('');
    onUpdated();
  };

  const badge = (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium font-body border ${statusBg[session.status]}`}>
      {statusIcon[session.status]}
      {statusLabel[session.status]}
    </span>
  );

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {badge}
        {session.status === 'scheduled' && (
          <button
            onClick={() => setShowModal(true)}
            className="px-2.5 py-1 bg-primary text-white rounded-lg text-xs font-medium font-body hover:bg-primary-light transition-colors"
          >
            Báo đã dạy
          </button>
        )}
        {showModal && <ClaimModal session={session} notes={notes} setNotes={setNotes} claiming={claiming} error={error} onClaim={handleClaim} onClose={() => setShowModal(false)} />}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gold/20 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-navy font-body">{session.class_name ?? 'Buổi học'}</p>
            <p className="text-xs text-charcoal/50 font-body">
              {new Date(session.session_date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
              {session.start_time && ` · ${session.start_time.slice(0, 5)}${session.end_time ? ` – ${session.end_time.slice(0, 5)}` : ''}`}
            </p>
          </div>
        </div>
        {badge}
      </div>

      {session.claim_notes && (
        <p className="text-xs text-charcoal/60 font-body bg-cream px-3 py-2 rounded-lg border border-gold/20">
          Ghi chú: {session.claim_notes}
        </p>
      )}

      {session.status === 'scheduled' && (
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg py-2.5 text-sm font-body font-semibold transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          Xác Nhận Đã Dạy
        </button>
      )}

      {session.status === 'claimed' && (
        <p className="text-xs text-blue-600 font-body text-center">
          Đã báo {session.claimed_at ? new Date(session.claimed_at).toLocaleDateString('vi-VN') : ''} · Chờ kiểm duyệt
        </p>
      )}

      {session.status === 'verified' && (
        <p className="text-xs text-green-600 font-body text-center">
          ✓ Đã kiểm duyệt {session.verified_at ? new Date(session.verified_at).toLocaleDateString('vi-VN') : ''}
        </p>
      )}

      {showModal && (
        <ClaimModal
          session={session}
          notes={notes}
          setNotes={setNotes}
          claiming={claiming}
          error={error}
          onClaim={handleClaim}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function ClaimModal({
  session,
  notes,
  setNotes,
  claiming,
  error,
  onClaim,
  onClose,
}: {
  session: ClassSession;
  notes: string;
  setNotes: (v: string) => void;
  claiming: boolean;
  error: string;
  onClaim: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-elegant w-full max-w-sm">
        <div className="p-6 border-b border-gold/20">
          <h2 className="text-lg font-semibold text-navy font-display">Xác Nhận Buổi Dạy</h2>
          <p className="text-sm text-charcoal/60 font-body mt-1">
            {session.class_name} · {new Date(session.session_date).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 font-body">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-navy font-body mb-1.5">Ghi chú buổi dạy (tuỳ chọn)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="VD: Đã dạy đủ nội dung, học viên tiến bộ tốt..."
              className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gold/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-body text-charcoal/60 hover:text-charcoal transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={onClaim}
            disabled={claiming}
            className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-5 py-2 font-body font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {claiming && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
