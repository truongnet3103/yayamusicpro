-- Add structured schedule columns to classes table
-- Needed for teacher/parent/student schedule views to show specific days and times
ALTER TABLE classes ADD COLUMN IF NOT EXISTS schedule_days text[] DEFAULT '{}';
ALTER TABLE classes ADD COLUMN IF NOT EXISTS start_time time;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS end_time time;
