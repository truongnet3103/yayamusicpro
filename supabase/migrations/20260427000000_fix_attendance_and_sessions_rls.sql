-- Migration: Fix RLS for attendance_records and class_sessions
-- Problems fixed:
--   1. attendance_records INSERT by teacher fails because school_id was missing from upsert
--      (fixed in frontend) but also ensure policy doesn't block teacher writes
--   2. class_sessions uses auth.jwt()->>'school_id' which is not in Supabase JWT by default
--      → replace with user_profiles lookup

-- ── class_sessions: drop broken JWT-based policy, replace with proper lookups ──

DROP POLICY IF EXISTS "school_isolation" ON class_sessions;

-- SELECT: teacher sees own sessions; admin/super_admin/staff see school's sessions
CREATE POLICY "class_sessions select" ON class_sessions
  FOR SELECT TO authenticated
  USING (
    -- Teacher sees their own sessions
    teacher_id IN (
      SELECT id FROM teachers WHERE user_id = (SELECT auth.uid())
    )
    OR
    -- Admin / super_admin / staff see all sessions in their school
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = (SELECT auth.uid())
        AND up.user_type IN ('admin', 'super_admin', 'it_admin', 'staff')
        AND (up.user_type = 'super_admin' OR up.school_id = class_sessions.school_id)
    )
  );

-- INSERT: only the assigned teacher can create their own session record
CREATE POLICY "class_sessions insert" ON class_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    teacher_id IN (
      SELECT id FROM teachers WHERE user_id = (SELECT auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = (SELECT auth.uid())
        AND up.user_type IN ('admin', 'super_admin')
        AND (up.user_type = 'super_admin' OR up.school_id = class_sessions.school_id)
    )
  );

-- UPDATE: teacher can claim (update status) their own sessions; admin can verify
CREATE POLICY "class_sessions update" ON class_sessions
  FOR UPDATE TO authenticated
  USING (
    teacher_id IN (
      SELECT id FROM teachers WHERE user_id = (SELECT auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = (SELECT auth.uid())
        AND up.user_type IN ('admin', 'super_admin')
        AND (up.user_type = 'super_admin' OR up.school_id = class_sessions.school_id)
    )
  );

-- DELETE: admin/super_admin only
CREATE POLICY "class_sessions delete" ON class_sessions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = (SELECT auth.uid())
        AND up.user_type IN ('admin', 'super_admin')
        AND (up.user_type = 'super_admin' OR up.school_id = class_sessions.school_id)
    )
  );

-- ── attendance_records: ensure teacher INSERT policy also works for upsert ──
-- The existing policy in 20260423000003 is correct structure-wise,
-- but re-create to make sure it's applied cleanly.

DROP POLICY IF EXISTS "Attendance insert"  ON attendance_records;
DROP POLICY IF EXISTS "Attendance update"  ON attendance_records;

CREATE POLICY "Attendance insert" ON attendance_records
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Admin / super_admin / it_admin
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = (SELECT auth.uid())
        AND up.user_type IN ('super_admin', 'it_admin', 'admin')
        AND (up.user_type = 'super_admin' OR up.school_id = attendance_records.school_id)
    )
    OR
    -- Teacher who is assigned to this class
    EXISTS (
      SELECT 1 FROM teachers t
      JOIN classes c ON c.teacher_id = t.id
      WHERE t.user_id = (SELECT auth.uid())
        AND c.id = attendance_records.class_id
    )
  );

CREATE POLICY "Attendance update" ON attendance_records
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = (SELECT auth.uid())
        AND up.user_type IN ('super_admin', 'it_admin', 'admin')
        AND (up.user_type = 'super_admin' OR up.school_id = attendance_records.school_id)
    )
    OR
    EXISTS (
      SELECT 1 FROM teachers t
      JOIN classes c ON c.teacher_id = t.id
      WHERE t.user_id = (SELECT auth.uid())
        AND c.id = attendance_records.class_id
    )
  );
