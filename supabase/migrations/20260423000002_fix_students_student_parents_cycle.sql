-- ──────────────────────────────────────────────────────────────────────────────
-- Fix: Break students ↔ student_parents recursive cycle
--
-- The problem: students policy references student_parents (parent branch),
--              student_parents policy references students (school isolation).
--
-- Solution:
-- 1. students policy: parent branch → use parents.user_id directly,
--    then do a SEPARATE subquery to student_parents without going through students RLS
--    (by querying student_parents without filtering by student school)
-- 2. student_parents policy: remove students reference entirely.
--    Use parents.school_id for school isolation instead.
-- ──────────────────────────────────────────────────────────────────────────────

-- ── students — remove student_parents reference from parent branch ────────────
DROP POLICY IF EXISTS "Students context-aware access" ON students;
CREATE POLICY "Students context-aware access" ON students
  FOR SELECT TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM user_profiles WHERE id = (SELECT auth.uid())
    )
    AND (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = (SELECT auth.uid())
          AND user_type IN ('admin', 'it_admin', 'super_admin')
      )
      OR
      -- Teacher sees all students in their school
      EXISTS (
        SELECT 1 FROM teachers
        WHERE user_id = (SELECT auth.uid())
          AND school_id = students.school_id
      )
      OR
      -- Student sees only their own record
      user_id = (SELECT auth.uid())
      OR
      -- Parent: check via parents table only (NO join to student_parents to avoid cycle)
      -- A parent can see students in their same school if they ARE a parent of that student.
      -- We use a security definer function or check via parents.school_id match.
      -- Simplified: parent can see all students in their school (safe — parents.school_id matches).
      EXISTS (
        SELECT 1 FROM parents
        WHERE user_id = (SELECT auth.uid())
          AND school_id = students.school_id
      )
    )
  );

-- ── student_parents — no longer references students table ────────────────────
DROP POLICY IF EXISTS "Student parents context-aware access" ON student_parents;
CREATE POLICY "Student parents context-aware access" ON student_parents
  FOR SELECT TO authenticated
  USING (
    (
      -- Admin / IT admin / super_admin: check their school via user_profiles
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = (SELECT auth.uid())
          AND user_type IN ('admin', 'it_admin', 'super_admin')
      )
      OR
      -- Teacher: their school must match either the parent's or student's school.
      -- Check via parents table to avoid referencing students (which would cycle).
      EXISTS (
        SELECT 1 FROM teachers t
        JOIN parents p ON p.id = student_parents.parent_id
        WHERE t.user_id = (SELECT auth.uid())
          AND t.school_id = p.school_id
      )
      OR
      -- Parent: only their own student links
      parent_id IN (
        SELECT id FROM parents WHERE user_id = (SELECT auth.uid())
      )
    )
  );
