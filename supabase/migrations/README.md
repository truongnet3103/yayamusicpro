# Supabase Migrations — YayaMusic CRM

> **Tất cả các file dưới đây đã được chạy trên production** (xpzxbsgkxtrcgliyavqs).
> Tên file theo format `YYYYMMDDHHMMSS_tên.sql` — Supabase tự sắp xếp theo thứ tự thời gian.

## Thứ tự chạy (từ cũ → mới)

| # | File | Nội dung | Trạng thái |
|---|------|----------|-----------|
| 1 | `20260118105004_create_education_crm_schema.sql` | Schema chính: tất cả bảng cơ bản (schools, users, classes, students, teachers, parents, enrollments, attendance_records, courses, roles, capabilities...) | ✅ Đã chạy |
| 2 | `20260118110059_create_notification_system_tables.sql` | Hệ thống thông báo: notif_events, notif_queue, notif_delivery_log, notif_subscriptions, notif_templates | ✅ Đã chạy |
| 3 | `20260118111811_add_multi_tenancy_enhancements.sql` | Multi-tenancy: school_domains, cải thiện RLS cho school isolation | ✅ Đã chạy |
| 4 | `20260118113637_fix_security_and_performance_issues.sql` | Fix bảo mật + performance: index, RLS policies, trigger updated_at | ✅ Đã chạy |
| 5 | `20260118114526_remove_unused_indexes_and_fix_security.sql` | Dọn index thừa, vá lỗ hổng bảo mật | ✅ Đã chạy |
| 6 | `20260118120000_fix_user_profiles_rls_recursion.sql` | Fix RLS recursion trên user_profiles | ✅ Đã chạy |
| 7 | `20260118121000_update_philippines_defaults.sql` | Đổi timezone/locale về Vietnam (Asia/Ho_Chi_Minh) | ✅ Đã chạy |
| 8 | `20260118130000_create_avatars_storage_bucket.sql` | Storage bucket cho avatar ảnh | ✅ Đã chạy |
| 9 | `20260422000000_add_class_sessions.sql` | Bảng `class_sessions`: xác nhận buổi dạy (teacher claim + admin verify) | ✅ Đã chạy |
| 10 | `20260423000000_fix_rls_and_seed_test_users.sql` | Fix RLS + seed 5 test accounts (super_admin, admin, teacher, parent, student) | ✅ Đã chạy |
| 11 | `20260423000001_fix_all_rls_cycles.sql` | Fix vòng lặp RLS trên nhiều bảng | ✅ Đã chạy |
| 12 | `20260423000002_fix_students_student_parents_cycle.sql` | Fix RLS cycle riêng cho students + student_parents | ✅ Đã chạy |
| 13 | `20260423000003_add_write_policies.sql` | Thêm INSERT/UPDATE/DELETE policies cho tất cả bảng | ✅ Đã chạy |
| 14 | `20260423000004_add_schools_write_policies.sql` | Write policies riêng cho bảng schools | ✅ Đã chạy |
| 15 | `20260423000005_fix_credits_overflow_and_superadmin_select.sql` | Fix credits column overflow + super_admin bypass SELECT trên teachers/courses | ✅ Đã chạy |
| 16 | `20260424000000_add_schedule_columns_to_classes.sql` | Thêm cột `schedule_days[]`, `start_time`, `end_time` vào bảng `classes` | ✅ Đã chạy |
| 17 | `20260425000000_fix_class_sessions_rls_select.sql` | Fix RLS SELECT cho class_sessions | ✅ Đã chạy |
| 18 | `20260426000000_add_schedule_slots.sql` | Bảng `schedule_slots` (config khung giờ sáng/chiều/tối) + cột `slot_id` trong classes | ✅ Đã chạy |

## Cách chạy migration mới

Migration mới **không cần chạy thủ công** — dùng API trực tiếp:

```bash
# Trong thư mục project, chạy Node.js:
node -e "
const fs = require('fs');
const sql = fs.readFileSync('./supabase/migrations/TÊN_FILE.sql', 'utf8');
const https = require('https');
const body = JSON.stringify({ query: sql });
const options = {
  method: 'POST',
  hostname: 'api.supabase.com',
  path: '/v1/projects/xpzxbsgkxtrcgliyavqs/database/query',
  headers: {
    'Authorization': 'Bearer sbp_83d3316791d6d601febbe3c32c343dda0c36109e',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
};
const req = https.request(options, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log(d || 'OK'));
});
req.write(body); req.end();
"
```

Trả về `[]` hoặc không có message = **thành công**.

## Quy tắc đặt tên file mới

Format: `YYYYMMDDHHMMSS_mô_tả_ngắn.sql`
- Ngày tháng năm: 8 chữ số `YYYYMMDD`  
- Giờ phút giây: 6 chữ số `HHMMSS` (dùng `000000` nếu không quan trọng)
- Mô tả: snake_case, ngắn gọn

Ví dụ: `20260427000000_add_teacher_notes_to_attendance.sql`
