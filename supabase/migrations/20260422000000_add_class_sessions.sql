-- Migration: Add class_sessions table for teacher session claiming
-- Run in Supabase Dashboard → SQL Editor

CREATE TABLE class_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  school_id     UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id    UUID NOT NULL REFERENCES teachers(id),
  session_date  DATE NOT NULL,
  start_time    TIME,
  end_time      TIME,
  status        TEXT NOT NULL DEFAULT 'scheduled'
                  CHECK (status IN ('scheduled', 'claimed', 'verified', 'cancelled')),
  claimed_at    TIMESTAMPTZ,
  claim_notes   TEXT,
  verified_by   UUID REFERENCES user_profiles(id),
  verified_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "school_isolation" ON class_sessions
  USING (school_id = (auth.jwt() ->> 'school_id')::uuid);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON class_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_class_sessions_class_id ON class_sessions(class_id);
CREATE INDEX idx_class_sessions_teacher_id ON class_sessions(teacher_id);
CREATE INDEX idx_class_sessions_school_date ON class_sessions(school_id, session_date);
