-- Add INSERT / UPDATE / DELETE policies for schools table
-- Only super_admin and it_admin can create or modify schools.
-- Regular admin manages within their own school, cannot create new schools.

DROP POLICY IF EXISTS "Schools insert" ON schools;
DROP POLICY IF EXISTS "Schools update" ON schools;
DROP POLICY IF EXISTS "Schools delete" ON schools;

CREATE POLICY "Schools insert" ON schools
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin')
    )
  );

CREATE POLICY "Schools update" ON schools
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin')
    )
  );

CREATE POLICY "Schools delete" ON schools
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'it_admin')
    )
  );
