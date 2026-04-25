# YayaMusic — Tài Liệu Tổng Quan

> Cập nhật lần cuối: 2026-04-22

## Tech Stack

| Layer | Công nghệ | Phiên bản |
|-------|-----------|-----------|
| Frontend | React | 18.3.1 |
| Language | TypeScript | 5.5.3 |
| Build Tool | Vite | 5.4.2 |
| Styling | Tailwind CSS | 3.4.1 |
| Routing | React Router DOM | 7.12.0 |
| Icons | Lucide React | 0.344.0 |
| Backend/Auth | Supabase JS | 2.57.4 |
| Database | PostgreSQL 15+ (via Supabase) | — |
| Storage | Supabase Storage (avatars bucket) | — |

---

## Kiến Trúc

**Pattern:** Domain-Driven Design (DDD) + Multi-Tenant Shared Schema

```
src/
├── domains/
│   ├── auth/            # Xác thực & phân quyền (AuthContext, UserContext, Guards)
│   ├── academic/        # Điểm danh, lớp học (hooks, services, components)
│   ├── communication/   # Thông báo (NotificationBell, NotificationDropdown, NotificationSettings)
│   └── admin/           # Quản trị (schoolStatsService, activityService)
├── pages/               # UI theo từng role (33 trang)
│   ├── public/          # HomePage (Landing page)
│   ├── auth/            # LoginPage, ForgotPasswordPage
│   ├── admin/           # 7 trang
│   ├── teacher/         # 7 trang
│   ├── parent/          # 8 trang
│   ├── student/         # 6 trang
│   ├── it/              # ITDashboard
│   ├── superadmin/      # SuperAdminDashboard
│   └── common/          # ProfilePage, NotFoundPage, UnauthorizedPage
├── layouts/             # DashboardLayout, Header, Sidebar, MobileNav, LandingNav
├── components/          # MusicNotesBackground (landing page animation)
├── routes/              # AppRouter.tsx
├── shared/
│   ├── contexts/        # TenantContext
│   ├── components/      # ErrorBoundary, LoadingSkeleton, guards (PermissionGuard, RoleGuard)
│   ├── services/        # apiClient.ts, avatarService.ts, loggingService.ts, tenantService.ts
│   ├── hooks/           # useApiRequest.ts, useFeature.ts
│   ├── utils/           # locale.ts, featureFlags.ts
│   └── lib/             # supabase.ts
└── App.tsx / main.tsx / index.css
```

---

## Design System — Classical European

### Bảng màu (Tailwind custom tokens)
| Token | Hex | Dùng cho |
|-------|-----|----------|
| `primary` / `bg-primary` | `#6B2D3E` | CTA, active nav, badge |
| `primary-light` | `#8B3D52` | Hover states |
| `primary-dark` | `#4A1E2B` | Pressed states |
| `gold` / `bg-gold` | `#C9A84C` | Accent, highlights, dividers |
| `gold-light` | `#E0C06A` | Hover gold |
| `cream` / `bg-cream` | `#F8F4E9` | Page background |
| `cream-dark` / `bg-cream-dark` | `#EDE8D5` | Card bg, sidebar |
| `navy` / `text-navy` | `#1B2A4A` | Headings |
| `charcoal` / `text-charcoal` | `#2C3E50` | Body text |

### Typography (Google Fonts)
| Token | Font | Dùng cho |
|-------|------|----------|
| `font-display` | Playfair Display | Heading h1–h3 |
| `font-body` | Be Vietnam Pro | Body, labels, navigation |
| `font-accent` | EB Garamond | Quotes, captions đặc biệt |

### Box Shadows
- `shadow-elegant` — `0 4px 24px rgba(107, 45, 62, 0.12)` — cards nổi bật
- `shadow-card` — `0 2px 12px rgba(0,0,0,0.08)` — cards thông thường

---

## Tính Năng Chính

### 1. Xác Thực (Authentication)
- Đăng nhập / đăng xuất qua email + password (Supabase Auth)
- Quên mật khẩu / đặt lại mật khẩu qua email
- JWT với custom claims: `school_id`, `user_type`
- Session tự động refresh do Supabase quản lý
- **`AuthContext`** methods: `signIn`, `signUp`, `signOut`, `resetPassword`
- **`UserContext`**: Fetch full profile từ `user_profiles` table

### 2. Phân Quyền (RBAC + Capability-Based)

**7 Roles:**
| Role | Mô tả | Route |
|------|-------|-------|
| `super_admin` | Quản lý toàn hệ thống | `/superadmin` |
| `it_admin` | Quản lý IT | `/it` |
| `admin` | Quản trị viên trung tâm | `/admin/**` |
| `staff` | Nhân viên | `/admin/**` |
| `teacher` | Giảng viên | `/teacher/**` |
| `parent` | Phụ huynh | `/parent/**` |
| `student` | Học viên | `/student/**` |

**Capability format:** `resource:action`
- Resources: `attendance`, `classes`, `students`, `teachers`, `parents`, `admin`, `notifications`, `reports`, `settings`, `users`, `grading`, `messaging`
- Actions: `create`, `read`, `update`, `delete`, `manage`, `view`, `mark`

**Guards:**
- `ProtectedRoute` — Yêu cầu đăng nhập (redirect `/login`)
- `RoleRoute` — Yêu cầu role cụ thể
- `CapabilityRoute` — Yêu cầu capability cụ thể
- `PermissionGuard` / `RoleGuard` — Dùng ở component level

### 3. Multi-Tenancy
- Mỗi trung tâm = 1 tenant, cách ly hoàn toàn qua `school_id`
- RLS policy trên tất cả 36+ bảng PostgreSQL
- Tenant resolve theo thứ tự: subdomain → JWT claims → HTTP headers
- Per-school: feature flags, subscription tier, storage quota

**Subscription tiers:** `free` / `basic` / `premium` / `enterprise`

### 4. Quản Lý Trung Tâm (Admin)

| Trang | Route | Chức năng |
|-------|-------|-----------|
| AdminDashboard | `/admin` | Tổng quan trung tâm |
| AdminSchoolsPage | `/admin/schools` | Quản lý cơ sở |
| AdminUsersPage | `/admin/users` | Giảng viên / Phụ huynh / Học viên |
| AdminRolesPage | `/admin/roles` | Phân quyền hệ thống |
| AdminClassesPage | `/admin/classes` | Lớp học nhạc |
| AdminReportsPage | `/admin/reports` | Báo cáo & thống kê |
| AdminSettingsPage | `/admin/settings` | Cài đặt trung tâm |

### 5. Module Điểm Danh

**Trạng thái:** `present` (Có mặt) | `absent` (Vắng mặt) | `late` (Đi trễ) | `excused` (Có phép)

**API Service (`attendanceService.ts`):**
- `getClassAttendance(classId, date)`
- `markAttendance(classId, studentId, date, status, checkInTime, notes)`
- `markBulkAttendance(records[])`
- `updateAttendance(attendanceId, updates)`
- `deleteAttendance(attendanceId)`
- `getStudentAttendance(studentId, startDate, endDate)`
- `getAttendanceSummary(academicTermId)`
- `getAttendanceAlerts(threshold, academicTermId)`

**Hooks:** `useAttendanceSummary`, `useTeacherClasses`, `useTeacherOverview`, `useParentStudents`, `useSchoolOverview`

**Components:** `TeacherAttendanceMarking.tsx`, `StudentAttendanceView.tsx`

### 6. Hệ Thống Thông Báo

**10 Event types:** `attendance_marked`, `attendance_absent`, `attendance_late`, `attendance_pattern`, `grade_posted`, `assignment_due`, `announcement_posted`, `fee_due`, `class_cancelled`, `message_received`

**Kênh:** In-app ✅ | Email 🔄 | SMS 🔄 | Push 🔄

**Components:** `NotificationBell.tsx`, `NotificationDropdown.tsx`, `NotificationSettings.tsx`

### 7. Trang Dashboard Theo Role

| Role | Các trang |
|------|-----------|
| Admin / Staff | Tổng quan, Cơ sở, Người dùng, Phân quyền, Lớp học nhạc, Báo cáo, Cài đặt |
| Teacher | Tổng quan, Lớp của tôi, Điểm danh, Nhật ký tiến độ, Lịch dạy, Tin nhắn, Cài đặt |
| Parent | Tổng quan, Con em, Điểm danh, Kết quả, Bài tập luyện, Học phí, Tin nhắn, Thông báo |
| Student | Tổng quan, Điểm danh, Kết quả, Bài tập luyện, Lịch học, Lớp đã đăng ký |
| Super Admin | `/superadmin` — Quản trị toàn hệ thống |
| IT Admin | `/it` — Bảng điều khiển IT |

### 8. Hồ Sơ & Avatar
- `ProfilePage.tsx` — Cập nhật thông tin cá nhân, upload ảnh đại diện
- `avatarService.ts` — Upload/xóa avatar từ Supabase Storage bucket `avatars`
- Giới hạn file: 5MB, chỉ chấp nhận jpeg/jpg/png/webp
- Sidebar hiển thị chữ viết tắt tên khi chưa có avatar

---

## Database Schema

### Core Tables
| Bảng | Mục đích |
|------|----------|
| `schools` | Root tenant entity (mỗi trung tâm = 1 school) |
| `user_profiles` | Thông tin người dùng mở rộng |
| `roles` | Định nghĩa role per school |
| `capabilities` | Định nghĩa permission (global) |
| `role_capabilities` | Mapping role–capability |
| `user_roles` | Mapping user–role |

### Academic Tables
| Bảng | Mục đích |
|------|----------|
| `students` | Hồ sơ học viên |
| `parents` | Hồ sơ phụ huynh |
| `student_parents` | Quan hệ học viên–phụ huynh |
| `teachers` | Hồ sơ giảng viên |
| `courses` | Danh mục khóa học |
| `classes` | Lớp học nhạc (instance của course) |
| `class_enrollments` | Đăng ký học |
| `attendance_records` | Bản ghi điểm danh |

### Notification Tables
| Bảng | Mục đích |
|------|----------|
| `notifications` | Thông báo in-app |
| `notif_events` | Định nghĩa event type |
| `notif_templates` | Template theo kênh/role |
| `notif_subscriptions` | Preferences người dùng |
| `notif_queue` | Hàng đợi gửi thông báo |
| `notif_delivery_log` | Tracking delivery |

### Security
- Row Level Security (RLS) trên tất cả bảng
- Policy pattern: `WHERE school_id = auth.jwt()->>'school_id'`
- Auto-update triggers cho `updated_at`
- Foreign key constraints với cascading deletes

---

## Routing Map

```
/ → RootRedirect (→ HomePage nếu chưa đăng nhập, → role route nếu đã đăng nhập)
├── /login
├── /forgot-password
├── /unauthorized
└── [ProtectedRoute → DashboardLayout]
    ├── /dashboard → DashboardRedirect (theo role)
    ├── /profile
    ├── /notifications/settings
    ├── /superadmin
    ├── /it
    ├── /admin
    ├── /admin/schools
    ├── /admin/users
    ├── /admin/roles
    ├── /admin/classes
    ├── /admin/reports
    ├── /admin/settings
    ├── /teacher
    ├── /teacher/classes
    ├── /teacher/classes/:id
    ├── /teacher/attendance
    ├── /teacher/attendance/:classId
    ├── /teacher/gradebook
    ├── /teacher/gradebook/:classId
    ├── /teacher/schedule
    ├── /teacher/messages
    ├── /teacher/settings
    ├── /parent
    ├── /parent/children
    ├── /parent/attendance
    ├── /parent/grades
    ├── /parent/assignments
    ├── /parent/fees
    ├── /parent/messages
    ├── /parent/notifications
    ├── /student
    ├── /student/attendance
    ├── /student/grades
    ├── /student/assignments
    ├── /student/schedule
    ├── /student/classes
    └── /student/classes/:id
* → NotFoundPage
```

---

## Migrations Supabase (thứ tự áp dụng)

| File | Nội dung |
|------|----------|
| `20260118105004` | Core schema: schools, users, roles, academic, attendance |
| `20260118110059` | Notification system tables |
| `20260118111811` | Multi-tenancy enhancements + RLS policies |
| `20260118113637` | Security & performance fixes |
| `20260118114526` | Remove unused indexes |
| `20260118120000` | Fix user_profiles RLS recursion |
| `20260118121000` | Vietnam locale defaults |
| `20260118130000` | Avatars storage bucket |

---

## Scripts

```bash
npm run dev              # Dev server tại localhost:5173
npm run build            # Production build → dist/
npm run preview          # Preview production build
npm run lint             # ESLint check
npm run typecheck        # TypeScript check (npx tsc --noEmit)
npm run create-users     # Tạo test users (scripts/create-test-users.ts)
npm run test-connection  # Kiểm tra kết nối Supabase
```

---

## Tài Khoản Test

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@admin.com | test1234 |
| Teacher | test@teacher.com | test1234 |
| Parent | test@parents.com | test1234 |
| Student | test@student.com | test1234 |

---

## Trạng Thái Hiện Tại

| Module | Status |
|--------|--------|
| Auth + RBAC + Capability | ✅ Hoàn chỉnh |
| Multi-tenancy + RLS | ✅ Hoàn chỉnh |
| Attendance CRUD | ✅ Hoàn chỉnh |
| In-app Notifications | ✅ Hoàn chỉnh |
| YayaMusic UI Redesign (tất cả roles) | ✅ Hoàn chỉnh |
| Landing page (nốt nhạc floating) | ✅ Hoàn chỉnh |
| Việt hóa toàn bộ UI | ✅ Hoàn chỉnh |
| Gradebook | 🔄 UI placeholder |
| Direct Messaging | 🔄 Contact list hoạt động, gửi tin nhắn đang phát triển |
| Fee Management | 🔄 UI placeholder |
| Email / SMS / Push Notifications | 🔄 Chưa triển khai |
| Analytics nâng cao | 🔄 Chưa triển khai |

---

## Deploy

- **Frontend:** Vercel (`vercel.json` cấu hình sẵn)
- **Database:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Build output:** `dist/` (Vite)
