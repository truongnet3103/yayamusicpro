-- Check existing users and their roles
SELECT
  up.id,
  up.email,
  up.first_name,
  up.last_name,
  up.user_type,
  up.school_id,
  s.name as school_name
FROM user_profiles up
LEFT JOIN schools s ON s.id = up.school_id
ORDER BY up.user_type, up.created_at;
