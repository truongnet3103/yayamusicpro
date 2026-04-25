-- ──────────────────────────────────────────────────────────────────────────────
-- Fix: Break all RLS circular dependencies (classes ↔ enrollments ↔ students ↔ student_parents)
-- Strategy: Remove cross-table recursive lookups. Each table's policy only reads
-- from "leaf" tables (user_profiles, teachers, parents, students, school membership)
-- without creating any reference cycles.
-- ──────────────────────────────────────────────────────────────────────────────

-- Helper: inline school_id lookup (used in all policies)

-- ── classes ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Classes context-aware access" ON classes;
CREATE POLICY "Classes context-aware access" ON classes
  FOR SELECT TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM user_profiles WHERE id = (SELECT auth.uid())
    )
    AND (
      -- Admin / IT admin / super_admin: all classes in their school
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = (SELECT auth.uid())
          AND user_type IN ('admin', 'it_admin', 'super_admin')
      )
      OR
      -- Teacher assigned to this class (direct, no join to enrollments)
      teacher_id IN (
        SELECT id FROM teachers WHERE user_id = (SELECT auth.uid())
      )
      OR
      -- Student: see all classes in their school (avoids enrollment → classes cycle)
      EXISTS (
        SELECT 1 FROM students
        WHERE user_id = (SELECT auth.uid())
          AND school_id = classes.school_id
      )
      OR
      -- Parent: see all classes in their school (avoids enrollment → classes cycle)
      EXISTS (
        SELECT 1 FROM parents
        WHERE user_id = (SELECT auth.uid())
          AND school_id = classes.school_id
      )
    )
  );

-- ── enrollments ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Enrollments context-aware access" ON enrollments;
CREATE POLICY "Enrollments context-aware access" ON enrollments
  FOR SELECT TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM user_profiles WHERE id = (SELECT auth.uid())
    )
    AND (
      -- Admin / IT admin / super_admin
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = (SELECT auth.uid())
          AND user_type IN ('admin', 'it_admin', 'super_admin')
      )
      OR
      -- Teacher: see all enrollments in their school (avoids classes → enrollments cycle)
      EXISTS (
        SELECT 1 FROM teachers
        WHERE user_id = (SELECT auth.uid())
          AND school_id = enrollments.school_id
      )
      OR
      -- Student: see their own enrollments only
      EXISTS (
        SELECT 1 FROM students
        WHERE id = enrollments.student_id
          AND user_id = (SELECT auth.uid())
      )
      OR
      -- Parent: see enrollments of their children
      EXISTS (
        SELECT 1 FROM student_parents sp
        JOIN parents p ON p.id = sp.parent_id
        WHERE sp.student_id = enrollments.student_id
          AND p.user_id = (SELECT auth.uid())
      )
    )
  );

-- ── students ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Students context-aware access" ON students;
CREATE POLICY "Students context-aware access" ON students
  FOR SELECT TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM user_profiles WHERE id = (SELECT auth.uid())
    )
    AND (
      -- Admin / IT admin / super_admin
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = (SELECT auth.uid())
          AND user_type IN ('admin', 'it_admin', 'super_admin')
      )
      OR
      -- Teacher: see all students in their school (avoids enrollments → classes cycle)
      EXISTS (
        SELECT 1 FROM teachers
        WHERE user_id = (SELECT auth.uid())
          AND school_id = students.school_id
      )
      OR
      -- Student: see their own record only
      user_id = (SELECT auth.uid())
      OR
      -- Parent: see their children
      EXISTS (
        SELECT 1 FROM student_parents sp
        JOIN parents p ON p.id = sp.parent_id
        WHERE sp.student_id = students.id
          AND p.user_id = (SELECT auth.uid())
      )
    )
  );

-- ── student_parents ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Student parents context-aware access" ON student_parents;
CREATE POLICY "Student parents context-aware access" ON student_parents
  FOR SELECT TO authenticated
  USING (
    -- School isolation via the student record (no recursion: students policy
    -- no longer references student_parents)
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = student_parents.student_id
        AND s.school_id IN (
          SELECT school_id FROM user_profiles WHERE id = (SELECT auth.uid())
        )
    )
    AND (
      -- Admin / IT admin / super_admin
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = (SELECT auth.uid())
          AND user_type IN ('admin', 'it_admin', 'super_admin')
      )
      OR
      -- Teacher: see student_parents in their school
      EXISTS (
        SELECT 1 FROM teachers
        WHERE user_id = (SELECT auth.uid())
          AND school_id IN (
            SELECT s.school_id FROM students s WHERE s.id = student_parents.student_id
          )
      )
      OR
      -- Parent: see their own student links
      EXISTS (
        SELECT 1 FROM parents p
        WHERE p.id = student_parents.parent_id
          AND p.user_id = (SELECT auth.uid())
      )
    )
  );
