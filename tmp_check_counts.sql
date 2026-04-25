-- Check tables data summary
SELECT
  'schools' as tbl, COUNT(*)::int as cnt FROM schools
UNION ALL SELECT 'teachers', COUNT(*)::int FROM teachers
UNION ALL SELECT 'students', COUNT(*)::int FROM students
UNION ALL SELECT 'parents', COUNT(*)::int FROM parents
UNION ALL SELECT 'classes', COUNT(*)::int FROM classes
UNION ALL SELECT 'courses', COUNT(*)::int FROM courses
UNION ALL SELECT 'enrollments', COUNT(*)::int FROM enrollments
UNION ALL SELECT 'attendance_records', COUNT(*)::int FROM attendance_records
UNION ALL SELECT 'class_sessions', COUNT(*)::int FROM class_sessions
UNION ALL SELECT 'user_profiles', COUNT(*)::int FROM user_profiles
UNION ALL SELECT 'roles', COUNT(*)::int FROM roles
UNION ALL SELECT 'capabilities', COUNT(*)::int FROM capabilities
ORDER BY tbl;
