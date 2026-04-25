-- ──────────────────────────────────────────────────────────────────────────────
-- Add INSERT / UPDATE / DELETE policies for classes, courses, teachers,
-- students, parents, enrollments, student_parents, class_sessions, attendance_records
--
-- Rule: admin / it_admin can write within their own school_id
--       super_admin can write to any school
-- ──────────────────────────────────────────────────────────────────────────────

-- Helper: returns true if caller is admin/it_admin/super_admin
-- We inline this as a subquery to avoid creating a function dependency.

-- ── courses ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Courses insert"  ON courses;
DROP POLICY IF EXISTS "Courses update"  ON courses;
DROP POLICY IF EXISTS "Courses delete"  ON courses;

CREATE POLICY "Courses insert" ON courses
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = courses.school_id)
    )
  );

CREATE POLICY "Courses update" ON courses
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = courses.school_id)
    )
  );

CREATE POLICY "Courses delete" ON courses
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = courses.school_id)
    )
  );

-- ── classes ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Classes insert"  ON classes;
DROP POLICY IF EXISTS "Classes update"  ON classes;
DROP POLICY IF EXISTS "Classes delete"  ON classes;

CREATE POLICY "Classes insert" ON classes
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = classes.school_id)
    )
  );

CREATE POLICY "Classes update" ON classes
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = classes.school_id)
    )
  );

CREATE POLICY "Classes delete" ON classes
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = classes.school_id)
    )
  );

-- ── teachers ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Teachers insert"  ON teachers;
DROP POLICY IF EXISTS "Teachers update"  ON teachers;
DROP POLICY IF EXISTS "Teachers delete"  ON teachers;

CREATE POLICY "Teachers insert" ON teachers
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = teachers.school_id)
    )
  );

CREATE POLICY "Teachers update" ON teachers
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = teachers.school_id)
    )
  );

CREATE POLICY "Teachers delete" ON teachers
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = teachers.school_id)
    )
  );

-- ── students ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Students insert"  ON students;
DROP POLICY IF EXISTS "Students update"  ON students;
DROP POLICY IF EXISTS "Students delete"  ON students;

CREATE POLICY "Students insert" ON students
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = students.school_id)
    )
  );

CREATE POLICY "Students update" ON students
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = students.school_id)
    )
  );

CREATE POLICY "Students delete" ON students
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = students.school_id)
    )
  );

-- ── parents ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Parents insert"  ON parents;
DROP POLICY IF EXISTS "Parents update"  ON parents;
DROP POLICY IF EXISTS "Parents delete"  ON parents;

CREATE POLICY "Parents insert" ON parents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = parents.school_id)
    )
  );

CREATE POLICY "Parents update" ON parents
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = parents.school_id)
    )
  );

CREATE POLICY "Parents delete" ON parents
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = parents.school_id)
    )
  );

-- ── enrollments ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Enrollments insert"  ON enrollments;
DROP POLICY IF EXISTS "Enrollments update"  ON enrollments;
DROP POLICY IF EXISTS "Enrollments delete"  ON enrollments;

CREATE POLICY "Enrollments insert" ON enrollments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = enrollments.school_id)
    )
  );

CREATE POLICY "Enrollments update" ON enrollments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = enrollments.school_id)
    )
  );

CREATE POLICY "Enrollments delete" ON enrollments
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = enrollments.school_id)
    )
  );

-- ── student_parents ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Student parents insert"  ON student_parents;
DROP POLICY IF EXISTS "Student parents update"  ON student_parents;
DROP POLICY IF EXISTS "Student parents delete"  ON student_parents;

CREATE POLICY "Student parents insert" ON student_parents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN parents p ON p.id = student_parents.parent_id
      WHERE up.id = (SELECT auth.uid())
        AND up.user_type IN ('super_admin', 'it_admin', 'admin')
        AND (up.user_type = 'super_admin' OR up.school_id = p.school_id)
    )
  );

CREATE POLICY "Student parents update" ON student_parents
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN parents p ON p.id = student_parents.parent_id
      WHERE up.id = (SELECT auth.uid())
        AND up.user_type IN ('super_admin', 'it_admin', 'admin')
        AND (up.user_type = 'super_admin' OR up.school_id = p.school_id)
    )
  );

CREATE POLICY "Student parents delete" ON student_parents
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN parents p ON p.id = student_parents.parent_id
      WHERE up.id = (SELECT auth.uid())
        AND up.user_type IN ('super_admin', 'it_admin', 'admin')
        AND (up.user_type = 'super_admin' OR up.school_id = p.school_id)
    )
  );

-- ── class_sessions ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Class sessions insert"  ON class_sessions;
DROP POLICY IF EXISTS "Class sessions update"  ON class_sessions;
DROP POLICY IF EXISTS "Class sessions delete"  ON class_sessions;

CREATE POLICY "Class sessions insert" ON class_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = class_sessions.school_id)
    )
    OR
    -- Teacher can insert (claim) their own sessions
    EXISTS (
      SELECT 1 FROM teachers
      WHERE user_id = (SELECT auth.uid())
        AND id = class_sessions.teacher_id
        AND school_id = class_sessions.school_id
    )
  );

CREATE POLICY "Class sessions update" ON class_sessions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = class_sessions.school_id)
    )
    OR
    -- Teacher can update their own sessions (e.g. claim)
    EXISTS (
      SELECT 1 FROM teachers
      WHERE user_id = (SELECT auth.uid())
        AND id = class_sessions.teacher_id
    )
  );

CREATE POLICY "Class sessions delete" ON class_sessions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = class_sessions.school_id)
    )
  );

-- ── attendance_records ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Attendance insert"  ON attendance_records;
DROP POLICY IF EXISTS "Attendance update"  ON attendance_records;
DROP POLICY IF EXISTS "Attendance delete"  ON attendance_records;

CREATE POLICY "Attendance insert" ON attendance_records
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = attendance_records.school_id)
    )
    OR
    -- Teacher can mark attendance for their class
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
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = attendance_records.school_id)
    )
    OR
    EXISTS (
      SELECT 1 FROM teachers t
      JOIN classes c ON c.teacher_id = t.id
      WHERE t.user_id = (SELECT auth.uid())
        AND c.id = attendance_records.class_id
    )
  );

CREATE POLICY "Attendance delete" ON attendance_records
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = attendance_records.school_id)
    )
  );
