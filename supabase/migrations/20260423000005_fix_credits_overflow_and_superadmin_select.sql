-- ──────────────────────────────────────────────────────────────────────────────
-- Fix 1: credits column overflow
--   numeric(4,2) = max 99.99 → expand to numeric(8,2) = max 999999.99
--
-- Fix 2: super_admin cannot see teachers/courses of other schools
--   The SELECT policies restrict by school_id, which locks super_admin
--   to their own school. Update policies to bypass the filter for super_admin.
-- ──────────────────────────────────────────────────────────────────────────────

-- ── courses.credits: expand precision ────────────────────────────────────────
ALTER TABLE courses ALTER COLUMN credits TYPE numeric(8,2);

-- ── teachers SELECT: allow super_admin to see all schools ─────────────────────
DROP POLICY IF EXISTS "Teachers school access" ON teachers;
CREATE POLICY "Teachers school access" ON teachers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type = 'super_admin'
    )
    OR
    school_id IN (
      SELECT school_id FROM user_profiles WHERE id = (SELECT auth.uid())
    )
  );

-- ── courses SELECT: allow super_admin to see all schools ─────────────────────
DROP POLICY IF EXISTS "Courses school access" ON courses;
CREATE POLICY "Courses school access" ON courses
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type = 'super_admin'
    )
    OR
    school_id IN (
      SELECT school_id FROM user_profiles WHERE id = (SELECT auth.uid())
    )
  );
