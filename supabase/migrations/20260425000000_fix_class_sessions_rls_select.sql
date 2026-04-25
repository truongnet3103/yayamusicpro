-- Fix class_sessions SELECT policy
-- Old policy used auth.jwt() ->> 'school_id' which requires custom JWT claims setup.
-- Replace with subquery pattern consistent with all other tables in this schema.

DROP POLICY IF EXISTS "school_isolation" ON class_sessions;
DROP POLICY IF EXISTS "Class sessions select" ON class_sessions;

-- Admin / super_admin / it_admin / staff: see all sessions in their school
CREATE POLICY "Class sessions select" ON class_sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin', 'staff')
        AND (user_type = 'super_admin' OR school_id = class_sessions.school_id)
    )
    OR
    -- Teacher: see only their own sessions
    EXISTS (
      SELECT 1 FROM teachers
      WHERE user_id = (SELECT auth.uid())
        AND id = class_sessions.teacher_id
    )
    OR
    -- Parent: see sessions for classes their children are enrolled in
    EXISTS (
      SELECT 1 FROM parents p
      JOIN student_parents sp ON sp.parent_id = p.id
      JOIN enrollments e ON e.student_id = sp.student_id
      WHERE p.user_id = (SELECT auth.uid())
        AND e.class_id = class_sessions.class_id
        AND e.status = 'active'
    )
  );
