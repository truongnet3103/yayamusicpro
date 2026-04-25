# YayaMusic — Agent Bootstrap Guide

Tài liệu này dành cho AI agents làm việc với project YayaMusic. Đọc trước khi thực hiện bất kỳ task nào liên quan đến Supabase deployment.

---

## 1. Thông Tin Dự Án

| Mục | Giá trị |
|-----|---------|
| Project name | YayaMusic CRM Education |
| Supabase Project Ref | `xpzxbsgkxtrcgliyavqs` |
| Supabase URL | `https://xpzxbsgkxtrcgliyavqs.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/xpzxbsgkxtrcgliyavqs |
| Functions Dashboard | https://supabase.com/dashboard/project/xpzxbsgkxtrcgliyavqs/functions |

Tất cả credentials đầy đủ trong file `.env` tại root project.

---

## 2. Supabase CLI — Cách Cài Và Dùng

### Supabase CLI **không có sẵn** trên máy (không cài qua npm được do Windows permissions).

**Cách cài đúng: Download binary trực tiếp**

```bash
# Bước 1 — Download binary Windows
curl -L https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.tar.gz -o /tmp/supabase.tar.gz

# Bước 2 — Giải nén
cd /tmp && tar -xzf supabase.tar.gz

# Bước 3 — Kiểm tra
/tmp/supabase.exe --version
```

Binary sẽ nằm tại `/tmp/supabase.exe` cho session đó. **Phải tải lại mỗi khi cần** (không persist qua session).

---

## 3. Deploy Edge Functions

Tất cả credentials cần thiết đã có trong `.env`. Dùng lệnh:

```bash
cd "d:/CRM Education"

SUPABASE_ACCESS_TOKEN=sbp_83d3316791d6d601febbe3c32c343dda0c36109e \
  /tmp/supabase.exe functions deploy <function-name> \
  --project-ref xpzxbsgkxtrcgliyavqs
```

**Ví dụ deploy `admin-users`:**
```bash
SUPABASE_ACCESS_TOKEN=sbp_83d3316791d6d601febbe3c32c343dda0c36109e \
  /tmp/supabase.exe functions deploy admin-users \
  --project-ref xpzxbsgkxtrcgliyavqs
```

### Lưu ý Docker Warning
Output sẽ có `WARNING: Docker is not running` — đây là **bình thường**, deploy vẫn thành công. Supabase CLI chỉ dùng Docker cho local dev, không cần cho remote deploy.

### Các Edge Functions Hiện Có
| Function | File | Mô tả |
|----------|------|-------|
| `admin-users` | `supabase/functions/admin-users/index.ts` | Tạo/xoá user (bypasses RLS) |
| `attendance` | `supabase/functions/attendance/index.ts` | Xử lý điểm danh |
| `notifications` | `supabase/functions/notifications/index.ts` | Gửi thông báo |

---

## 4. Chạy DB Migrations

Supabase CLI không cần thiết cho migrations — paste SQL vào Supabase Dashboard.

```
https://supabase.com/dashboard/project/xpzxbsgkxtrcgliyavqs/sql/new
```

**Các migration files** nằm tại `supabase/migrations/` — chạy theo thứ tự timestamp.

Migration quan trọng chưa chạy (kiểm tra trước):
- `20260422000000_add_class_sessions.sql` — tạo bảng `class_sessions` cho teacher session claiming

---

## 5. Kiểm Tra Function Đã Deploy

```bash
# Liệt kê tất cả functions đang live
SUPABASE_ACCESS_TOKEN=sbp_83d3316791d6d601febbe3c32c343dda0c36109e \
  /tmp/supabase.exe functions list --project-ref xpzxbsgkxtrcgliyavqs
```

---

## 6. Test Sau Deploy

```bash
# Test admin-users function (thay <ANON_KEY> bằng giá trị trong .env)
curl -X GET https://xpzxbsgkxtrcgliyavqs.supabase.co/functions/v1/admin-users \
  -H "Authorization: Bearer <USER_JWT>" \
  -H "Content-Type: application/json"
```

---

## 7. Dev Server

```bash
cd "d:/CRM Education"
npm run dev
```

App chạy tại `http://localhost:5173`.

---

## 8. Test Accounts Theo Role

Xem credentials đầy đủ tại `docs/OVERVIEW.md`. Các role chính:

| Role | Dashboard Path |
|------|---------------|
| `super_admin` | `/superadmin` |
| `admin` | `/admin` |
| `teacher` | `/teacher` |
| `parent` | `/parent` |
| `student` | `/student` |

---

## 9. Quy Tắc Quan Trọng (Từ CLAUDE.md)

- **KHÔNG** sửa business logic: services, hooks, contexts, types
- **KHÔNG** đổi route paths
- **KHÔNG** đổi RBAC/Guard components
- **KHÔNG** thêm i18n library — dịch inline trong JSX
- Text UI phải bằng **Tiếng Việt**
- Design tokens trong `tailwind.config.js` — không hardcode màu
