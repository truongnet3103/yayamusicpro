-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: Fix circular RLS + seed test user linked records
-- Date: 2026-04-23
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. FIX CIRCULAR RLS ON classes ↔ enrollments
-- The classes policy joins enrollments (for student access),
-- and enrollments policy joins back to classes (for teacher access) → infinite recursion.
-- Fix: keep the dependency chain one-directional only.

DROP POLICY IF EXISTS "Classes context-aware access" ON classes;
CREATE POLICY "Classes context-aware access" ON classes
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
      teacher_id IN (
        SELECT id FROM teachers WHERE user_id = (SELECT auth.uid())
      )
      OR
      EXISTS (
        SELECT 1 FROM students s
        JOIN enrollments e ON e.student_id = s.id
        WHERE s.user_id = (SELECT auth.uid())
          AND e.class_id = classes.id
          AND e.status = 'active'
      )
      OR
      EXISTS (
        SELECT 1 FROM parents p
        JOIN student_parents sp ON sp.parent_id = p.id
        JOIN enrollments e ON e.student_id = sp.student_id
        WHERE p.user_id = (SELECT auth.uid())
          AND e.class_id = classes.id
          AND e.status = 'active'
      )
    )
  );

-- Enrollments policy: teacher branch uses classes → teachers directly.
-- This is safe because classes policy does NOT call back to enrollments for teacher check.
DROP POLICY IF EXISTS "Enrollments context-aware access" ON enrollments;
CREATE POLICY "Enrollments context-aware access" ON enrollments
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
      EXISTS (
        SELECT 1 FROM classes c
        JOIN teachers t ON t.id = c.teacher_id
        WHERE c.id = enrollments.class_id
          AND t.user_id = (SELECT auth.uid())
      )
      OR
      EXISTS (
        SELECT 1 FROM students s
        WHERE s.id = enrollments.student_id
          AND s.user_id = (SELECT auth.uid())
      )
      OR
      EXISTS (
        SELECT 1 FROM student_parents sp
        JOIN parents p ON p.id = sp.parent_id
        WHERE sp.student_id = enrollments.student_id
          AND p.user_id = (SELECT auth.uid())
      )
    )
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. SEED LINKED RECORDS FOR TEST USERS
-- ──────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_school_id   UUID := 'df17b6b3-bcdb-4e19-98fa-86fdfe6c6a5e';
  v_teacher_uid UUID := 'd7fcf07d-26d3-473b-a083-086e7dfd2f76';
  v_parent_uid  UUID := 'f70fbf06-4817-446e-9df4-3cb6b5ce69bf';
  v_student_uid UUID := '1f691908-f7de-4c14-a22f-8997dc5590ec';
  v_teacher_id  UUID;
  v_parent_id   UUID;
  v_student_id  UUID;
  v_class_id    UUID;
  v_course_id   UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_teacher_uid) THEN
    INSERT INTO teachers (user_id, school_id, first_name, last_name, email, employee_code, specialization)
    VALUES (v_teacher_uid, v_school_id, 'Test', 'Teacher', 'test@teacher.com', 'EMP-TEST-001', 'Piano')
    RETURNING id INTO v_teacher_id;
  ELSE
    SELECT id INTO v_teacher_id FROM teachers WHERE user_id = v_teacher_uid;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM parents WHERE user_id = v_parent_uid) THEN
    INSERT INTO parents (user_id, school_id, first_name, last_name, email)
    VALUES (v_parent_uid, v_school_id, 'Test', 'Parent', 'test@parents.com')
    RETURNING id INTO v_parent_id;
  ELSE
    SELECT id INTO v_parent_id FROM parents WHERE user_id = v_parent_uid;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM students WHERE user_id = v_student_uid) THEN
    INSERT INTO students (user_id, school_id, first_name, last_name, email, student_code)
    VALUES (v_student_uid, v_school_id, 'Test', 'Student', 'test@student.com', 'STU-TEST-001')
    RETURNING id INTO v_student_id;
  ELSE
    SELECT id INTO v_student_id FROM students WHERE user_id = v_student_uid;
  END IF;

  SELECT id INTO v_class_id FROM classes
  WHERE teacher_id = v_teacher_id AND school_id = v_school_id LIMIT 1;

  IF v_class_id IS NULL THEN
    SELECT id INTO v_course_id FROM courses WHERE school_id = v_school_id LIMIT 1;
    IF v_course_id IS NULL THEN
      INSERT INTO courses (school_id, name, code, description, is_active)
      VALUES (v_school_id, 'Đàn Piano Cơ Bản', 'PIANO-101', 'Khóa học piano dành cho người mới bắt đầu', true)
      RETURNING id INTO v_course_id;
    END IF;
    INSERT INTO classes (school_id, teacher_id, course_id, name, code, schedule, status)
    VALUES (v_school_id, v_teacher_id, v_course_id, 'Piano 101', 'CLS-TEST-001', 'Thứ 2 & 4, 09:00-10:00', 'active')
    RETURNING id INTO v_class_id;
  END IF;

  IF v_class_id IS NOT NULL AND v_student_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM enrollments WHERE class_id = v_class_id AND student_id = v_student_id) THEN
      INSERT INTO enrollments (school_id, class_id, student_id, status)
      VALUES (v_school_id, v_class_id, v_student_id, 'active');
    END IF;
  END IF;

  IF v_parent_id IS NOT NULL AND v_student_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM student_parents WHERE parent_id = v_parent_id AND student_id = v_student_id) THEN
      INSERT INTO student_parents (parent_id, student_id, relationship)
      VALUES (v_parent_id, v_student_id, 'guardian');
    END IF;
  END IF;

  RAISE NOTICE 'Seeded: teacher_id=%, parent_id=%, student_id=%, class_id=%',
    v_teacher_id, v_parent_id, v_student_id, v_class_id;
END $$;
