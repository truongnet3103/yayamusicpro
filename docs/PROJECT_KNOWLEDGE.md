# YayaMusic — Toàn Bộ Kiến Thức Dự Án

> Tài liệu tổng hợp đầy đủ mọi thông tin về codebase, UI, architecture và trạng thái triển khai.
> Cập nhật lần cuối: 2026-04-22

---

## 1. TỔNG QUAN DỰ ÁN

**Tên sản phẩm:** YayaMusic — Hệ Thống Quản Lý Trung Tâm Đào Tạo Âm Nhạc

**Mục đích:** Phần mềm SaaS multi-tenant quản lý toàn diện cho trung tâm âm nhạc tại Việt Nam:
điểm danh học viên, quản lý lớp học nhạc, liên lạc phụ huynh–giảng viên, báo cáo và thông báo.

**Thị trường:** Việt Nam — ngôn ngữ Tiếng Việt, locale `Asia/Ho_Chi_Minh`, tiền tệ VNĐ (₫).

**Codebase gốc:** https://github.com/msoyaph/education (Education CRM cho Philippines, tiếng Anh)
**Trạng thái hiện tại:** Đã Việt hóa hoàn toàn + redesign theo phong cách Classical European.

---

## 2. TECH STACK

| Layer | Công nghệ | Phiên bản |
|-------|-----------|-----------|
| Frontend | React | ^18.3.1 |
| Language | TypeScript | ^5.5.3 |
| Build Tool | Vite | ^5.4.2 |
| Styling | Tailwind CSS | ^3.4.1 |
| Routing | React Router DOM | ^7.12.0 |
| Icons | Lucide React | ^0.344.0 |
| Backend/Auth | Supabase JS | ^2.57.4 |
| Database | PostgreSQL 15+ (via Supabase) | — |

**Không có:** i18n library (text hardcoded trong JSX), component library, state management library ngoài React Context.

---

## 3. KIẾN TRÚC TỔNG THỂ

### Pattern: Domain-Driven Design (DDD) + Multi-Tenant Shared Schema

```
src/
├── domains/                  # Logic nghiệp vụ — KHÔNG sửa đổi
│   ├── auth/
│   │   ├── components/       # ProtectedRoute, RoleRoute, CapabilityRoute
│   │   ├── contexts/         # AuthContext, UserContext
│   │   └── utils/            # capabilities.ts, roleRedirect.ts
│   ├── academic/
│   │   ├── components/attendance/  # TeacherAttendanceMarking, StudentAttendanceView
│   │   ├── hooks/            # useAttendanceSummary, useTeacherClasses, useParentStudents, useSchoolOverview, useTeacherOverview
│   │   ├── services/         # attendanceService.ts
│   │   └── types/            # attendance.ts
│   ├── admin/
│   │   └── services/         # activityService.ts, schoolStatsService.ts
│   └── communication/
│       ├── components/notifications/  # NotificationBell, NotificationDropdown, NotificationSettings
│       ├── services/         # notificationService.ts
│       └── types/            # notification.ts
├── pages/                    # 33 trang UI
│   ├── public/               # HomePage
│   ├── auth/                 # LoginPage, ForgotPasswordPage
│   ├── admin/                # AdminDashboard, AdminSchoolsPage, AdminUsersPage, AdminRolesPage, AdminClassesPage, AdminReportsPage, AdminSettingsPage
│   ├── teacher/              # TeacherDashboard, TeacherClassesPage, TeacherAttendancePage, TeacherGradebookPage, TeacherSchedulePage, TeacherMessagesPage, TeacherSettingsPage
│   ├── parent/               # ParentDashboard, ParentChildrenPage, ParentAttendancePage, ParentGradesPage, ParentAssignmentsPage, ParentFeesPage, ParentMessagesPage, ParentNotificationsPage
│   ├── student/              # StudentDashboard, StudentAttendancePage, StudentGradesPage, StudentAssignmentsPage, StudentSchedulePage, StudentClassesPage
│   ├── it/                   # ITDashboard
│   ├── superadmin/           # SuperAdminDashboard
│   └── common/               # ProfilePage, NotFoundPage, UnauthorizedPage
├── layouts/
│   └── components/           # DashboardLayout, Header, Sidebar, MobileNav, LandingNav
├── components/               # MusicNotesBackground (hiệu ứng nốt nhạc landing)
├── routes/                   # AppRouter.tsx
├── shared/
│   ├── contexts/             # TenantContext
│   ├── components/           # ErrorBoundary, LoadingSkeleton; guards/PermissionGuard, guards/RoleGuard
│   ├── services/             # apiClient.ts, avatarService.ts, loggingService.ts, tenantService.ts
│   ├── hooks/                # useApiRequest.ts, useFeature.ts
│   ├── utils/                # locale.ts (Vietnam), featureFlags.ts
│   └── lib/                  # supabase.ts
└── App.tsx / main.tsx / index.css
```

---

## 4. DESIGN SYSTEM — CLASSICAL EUROPEAN

### 4.1 Bảng màu (Tailwind custom tokens trong `tailwind.config.js`)

| Token | Hex | Mục đích |
|-------|-----|----------|
| `primary` | `#6B2D3E` | Nút CTA chính, active nav, badge thông báo |
| `primary-light` | `#8B3D52` | Hover state của nút primary |
| `primary-dark` | `#4A1E2B` | Active/pressed state |
| `gold` | `#C9A84C` | Accent, highlight, viền divider |
| `gold-light` | `#E0C06A` | Hover state gold |
| `gold-dark` | `#A8872E` | Dark gold |
| `cream` | `#F8F4E9` | Nền trang chính |
| `cream-dark` | `#EDE8D5` | Nền card, sidebar |
| `navy` | `#1B2A4A` | Heading text chính |
| `navy-light` | `#263C6B` | Sub-heading |
| `charcoal` | `#2C3E50` | Body text |

### 4.2 Typography

| Token Tailwind | Font | Weights | Dùng cho |
|---------------|------|---------|----------|
| `font-display` | Playfair Display | 400, 600, 700, 900 | h1–h3, page titles |
| `font-body` | Be Vietnam Pro | 300, 400, 500, 600 | Body, labels, nav, buttons |
| `font-accent` | EB Garamond | 400, 500, 600 | Quotes, captions nghệ thuật |

Fonts được load qua Google Fonts trong `index.html`.

### 4.3 Box Shadows

| Token | Value | Dùng cho |
|-------|-------|----------|
| `shadow-elegant` | `0 4px 24px rgba(107, 45, 62, 0.12)` | Cards nổi bật, hover |
| `shadow-card` | `0 2px 12px rgba(0,0,0,0.08)` | Cards thông thường |

### 4.4 Component patterns (tái sử dụng toàn hệ thống)

```
Card:          bg-white rounded-xl border border-gold/20 shadow-card
Button primary: bg-primary text-white hover:bg-primary-light rounded-lg px-6 py-3 font-body font-semibold
Button outline: border-2 border-primary text-primary hover:bg-primary/5 rounded-lg
Input:         border border-gold/40 rounded-lg bg-white focus:ring-2 focus:ring-primary/30
Active nav:    bg-primary/10 text-primary font-semibold border-l-2 border-primary
Sidebar bg:    bg-cream-dark border-r border-gold/20
Header bg:     bg-white border-b border-gold/20 shadow-sm
Loading spin:  animate-spin rounded-full border-b-2 border-primary
```

### 4.5 Biểu tượng âm nhạc (decorative only)
`♩ ♪ ♫ ♬ 𝄞 𝄢` — opacity rất thấp (0.06–0.15), không dùng cho chức năng.
Component `MusicNotesBackground` dùng chúng để tạo hiệu ứng bay trên landing page.

---

## 5. CẤU HÌNH FILES QUAN TRỌNG

### `tailwind.config.js`
Chứa toàn bộ custom design tokens (colors, fontFamily, boxShadow, borderRadius).
Không dùng Tailwind màu mặc định cho brand colors — luôn dùng token custom.

### `index.html`
```html
<title>YayaMusic — Hệ Thống Quản Lý Trung Tâm Âm Nhạc</title>
```
Chứa Google Fonts preconnect + stylesheet cho Playfair Display, Be Vietnam Pro, EB Garamond.

### `src/shared/utils/locale.ts`
```ts
export const APP_LOCALE = {
  country: 'Vietnam',
  countryCode: 'VN',
  timezone: 'Asia/Ho_Chi_Minh',
  currency: 'VND',
  currencySymbol: '₫',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  language: 'vi',
  phoneCode: '+84',
};
```
Danh sách thành phố: Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ, Hải Phòng, Huế, v.v.

### `src/shared/lib/supabase.ts`
Khởi tạo Supabase client từ `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` trong `.env`.

---

## 6. LAYOUT & NAVIGATION

### `DashboardLayout` (`layouts/components/DashboardLayout.tsx`)
- Flexbox ngang: Sidebar (256px) + Main content (flex-1)
- Sidebar tự xử lý responsive: `lg:static` (desktop) / `fixed translate-x` (mobile)
- Header sticky top trong main area
- Mobile bottom nav riêng (`MobileNav`)
- Background: `bg-cream`

### `Sidebar` (`layouts/components/Sidebar.tsx`)
- Logo: `♪ YayaMusic` — font-display, text-primary
- Nền: `bg-cream-dark border-r border-gold/20`
- Nav item mặc định: `text-charcoal hover:bg-primary/8 rounded-lg`
- Nav item active: `bg-primary/10 text-primary font-semibold border-l-2 border-primary`
- User card bottom: tên + role + avatar (hoặc initials)
- Hiển thị nav items theo role của người dùng

### `Header` (`layouts/components/Header.tsx`)
- Logo nhỏ + "YayaMusic" cho mobile
- NotificationBell với badge đỏ
- User menu dropdown: Hồ sơ / Cài đặt / Đăng xuất
- Nền: `bg-white border-b border-gold/20`

### `LandingNav` (`layouts/components/LandingNav.tsx`)
- Logo: note nhạc + "YayaMusic"
- Links: Tính Năng | Học Phí | Về Chúng Tôi
- CTA: "Dùng Thử Miễn Phí" — bg-primary
- Nền: `bg-white/95 backdrop-blur border-b border-gold/20`

### `MobileNav`
- Bottom navigation bar cho mobile
- Labels tiếng Việt theo role

---

## 7. TRANG VÀ NỘI DUNG CHI TIẾT

### Landing Page (`/` — `HomePage.tsx`)
Hiển thị cho khách chưa đăng nhập.

**Sections:**
1. **Hero** — Nền `bg-gradient-to-br from-navy via-primary-dark to-navy` + `MusicNotesBackground`
   - Heading: "Nâng Tầm Âm Nhạc — Tinh Tế Từng Nốt Nhạc"
   - CTA: "Bắt Đầu Miễn Phí" (bg-gold) + "Xem Demo" (outline)
2. **Stats bar** — 4 con số: tiết kiệm giờ, tăng tương tác, uptime, dễ dùng
3. **Features grid** — 6 cards: Điểm danh, Thông báo, Phân tích, Đa vai trò, Liên lạc, Bảo mật
4. **Pricing** — 3 gói VNĐ: Cơ Bản (690k), Chuyên Nghiệp (1.89tr, highlighted), Doanh Nghiệp
5. **Testimonials** — Giám đốc Nguyễn Thị Lan, Trung tâm Âm nhạc Thăng Long
6. **CTA cuối** — Nền `bg-primary` gradient
7. **Footer** — 4 cột, logo YayaMusic + tagline

### `MusicNotesBackground` (`components/MusicNotesBackground.tsx`)
- Canvas/div overlay: nốt nhạc Unicode floating từ dưới lên
- Mouse parallax: nốt dịch chuyển theo cursor
- `pointer-events: none`, `position: fixed`, `z-index: 0`
- Màu `text-primary/10` hoặc `text-gold/15` — cực kỳ mờ

### Login Page (`/login`)
- Layout 2 cột: panel trang trí âm nhạc (bg-primary) + form đăng nhập
- Form: Email, Mật khẩu, "Nhớ đăng nhập", "Quên mật khẩu?"
- Button: "Đăng Nhập" (bg-primary)

### Forgot Password Page (`/forgot-password`)
- Tiêu đề: "Khôi Phục Mật Khẩu"
- Input email + gửi link đặt lại
- Link quay lại đăng nhập

### Admin Dashboard (`/admin`)
- Stats: Tổng học viên | Giảng viên | Lớp học | Tỉ lệ điểm danh
- Lấy data từ `getSchoolStats()` + `getRecentActivity()`
- Cards: `bg-white border border-gold/20 rounded-xl shadow-card`

### Teacher Dashboard (`/teacher`)
- Stats: Lớp của tôi | Học viên | Điểm danh hôm nay
- Lấy data từ `useTeacherOverview()`

### Teacher Messages (`/teacher/messages`)
- Load danh sách học viên từ lớp của giảng viên: `classes` → `class_enrollments` → `students`
- Load phụ huynh tương ứng: `student_parents` → `parents`
- Giao diện 2 panel: contacts list (trái) + message view (phải)
- Gửi tin nhắn: đang phát triển (placeholder)

### Parent Messages (`/parent/messages`)
- Load giảng viên của con em:
  1. `parents` by `user_id`
  2. `student_parents` → `student_id[]`
  3. `class_enrollments` → `class_id[]`
  4. `classes` JOIN `teachers` JOIN `user_profiles`
- Dedup bằng `Map<string, MessageContact>`
- Giao diện 2 panel giống Teacher Messages

### Profile Page (`/profile`)
- Hiển thị và cập nhật: tên, email, điện thoại, địa chỉ
- Upload avatar: max 5MB, jpeg/jpg/png/webp
- `avatarService.uploadAvatar(file, userId, schoolId)` → Supabase Storage `avatars` bucket

### Not Found Page (`/404` và `*`)
- Ký hiệu nhạc lớn `𝄞` trong vòng tròn
- "404 — Trang Không Tìm Thấy"

### Unauthorized Page (`/unauthorized`)
- "403 — Không Có Quyền Truy Cập"

---

## 8. HỆ THỐNG PHÂN QUYỀN

### 7 Roles và Route của họ
| Role | Routes |
|------|--------|
| `super_admin` | `/superadmin` |
| `it_admin` | `/it` |
| `admin` | `/admin/**` |
| `staff` | `/admin/**` (subset permissions) |
| `teacher` | `/teacher/**` |
| `parent` | `/parent/**` |
| `student` | `/student/**` |

### Capability Resources & Actions
**Resources:** `attendance`, `classes`, `students`, `teachers`, `parents`, `admin`, `notifications`, `reports`, `settings`, `users`, `grading`, `messaging`
**Actions:** `create`, `read`, `update`, `delete`, `manage`, `view`, `mark`, `approve`

Ví dụ: `attendance:mark` (teacher), `grading:create` (teacher), `students:view` (parent — chỉ con của họ)

### Guards
- `ProtectedRoute` — Kiểm tra session Supabase Auth (file: `domains/auth/components/ProtectedRoute.tsx`)
- `RoleRoute` — Kiểm tra `profile.user_type` (file: `domains/auth/components/RoleRoute.tsx`)
- `CapabilityRoute` — Kiểm tra capability từ `user_roles`/`role_capabilities` tables
- `RoleGuard` — Component-level (ẩn UI element) (file: `shared/components/guards/RoleGuard.tsx`)
- `PermissionGuard` — Component-level với capability check (file: `shared/components/guards/PermissionGuard.tsx`)

---

## 9. MULTI-TENANCY

- Mỗi trung tâm âm nhạc = 1 bản ghi trong bảng `schools`
- Mọi query Supabase đều filtered theo `school_id`
- RLS policy trên 36+ bảng: `WHERE school_id = auth.jwt()->>'school_id'`
- Tenant resolve trong `TenantContext`:
  1. Subdomain: `{school-slug}.yayamusic.app`
  2. JWT claims: `school_id`, `school_slug`
  3. HTTP header: `X-School-ID`, `X-School-Slug`

### Feature Flags
Hook `useFeature('feature-name')` đọc từ `featureFlags.ts`, cho phép bật/tắt tính năng theo subscription tier của tenant.

**Subscription tiers:** `free` → `basic` → `premium` → `enterprise`

---

## 10. MODULE ĐIỂM DANH

### Trạng thái điểm danh
| Tiếng Anh | Tiếng Việt | DB value |
|-----------|-----------|----------|
| Present | Có mặt | `present` |
| Absent | Vắng mặt | `absent` |
| Late | Đi trễ | `late` |
| Excused | Có phép | `excused` |

### Service API (`domains/academic/services/attendanceService.ts`)
```ts
getClassAttendance(classId: string, date: string)
markAttendance(classId, studentId, date, status, checkInTime?, notes?)
markBulkAttendance(records: AttendanceRecord[])
updateAttendance(attendanceId: string, updates: Partial<AttendanceRecord>)
deleteAttendance(attendanceId: string)
getStudentAttendance(studentId: string, startDate: string, endDate: string)
getAttendanceSummary(academicTermId: string)
getAttendanceAlerts(threshold: number, academicTermId: string)
```

### Hooks
- `useAttendanceSummary()` — Đọc `attendance_records` từ Supabase theo school_id, tính stats tuần/ngày
- `useTeacherClasses()` — Danh sách lớp giảng viên đang dạy
- `useTeacherOverview()` — Tổng quan dashboard giảng viên
- `useParentStudents()` — Danh sách con của phụ huynh qua `student_parents`
- `useSchoolOverview()` — Tổng quan trung tâm, dùng `getSchoolStats()` + `getRecentActivity()`

### Components
- `TeacherAttendanceMarking.tsx` — UI đánh dấu điểm danh theo lớp (filter by date)
- `StudentAttendanceView.tsx` — UI xem điểm danh cá nhân học viên

---

## 11. HỆ THỐNG THÔNG BÁO

### 10 Event types
| Event | Mô tả |
|-------|-------|
| `attendance_marked` | Đã điểm danh |
| `attendance_absent` | Vắng mặt |
| `attendance_late` | Đi trễ |
| `attendance_pattern` | Pattern vắng nhiều |
| `grade_posted` | Điểm/kết quả được đăng |
| `assignment_due` | Bài tập sắp hết hạn |
| `announcement_posted` | Thông báo mới |
| `fee_due` | Học phí sắp đến hạn |
| `class_cancelled` | Lớp bị hủy |
| `message_received` | Tin nhắn mới |

### Kênh hỗ trợ
- In-app ✅ (NotificationBell + NotificationDropdown)
- Email 🔄 (chưa triển khai)
- SMS 🔄 (chưa triển khai)
- Push 🔄 (chưa triển khai)

### Service API (`domains/communication/services/notificationService.ts`)
- `getNotifications(limit, offset, status, eventType)`
- `getUnreadCount()`
- Quản lý notification preferences

### Components
- `NotificationBell.tsx` — Icon chuông trong Header, badge đỏ số chưa đọc (`bg-primary`)
- `NotificationDropdown.tsx` — Dropdown list thông báo gần đây, "Xem tất cả", "Đánh dấu đã đọc"
- `NotificationSettings.tsx` — Toggle preferences theo kênh và event type (route: `/notifications/settings`)

---

## 12. DATABASE SCHEMA

### Core Tables
| Bảng | Mục đích |
|------|----------|
| `schools` | Root tenant — mỗi trung tâm = 1 row |
| `user_profiles` | Thông tin mở rộng của auth.users |
| `roles` | Định nghĩa role (per school) |
| `capabilities` | Định nghĩa permission (global) |
| `role_capabilities` | Mapping role → capabilities |
| `user_roles` | Mapping user → role (per school) |

### Academic Tables
| Bảng | Mục đích |
|------|----------|
| `students` | Hồ sơ học viên |
| `parents` | Hồ sơ phụ huynh |
| `student_parents` | Quan hệ học viên–phụ huynh (nhiều-nhiều) |
| `teachers` | Hồ sơ giảng viên |
| `courses` | Danh mục khóa học/môn nhạc |
| `classes` | Lớp học nhạc (instance của course) |
| `class_enrollments` | Học viên đăng ký lớp (nhiều-nhiều) |
| `attendance_records` | Bản ghi điểm danh (school_id + class_id + date + status) |

### Notification Tables
| Bảng | Mục đích |
|------|----------|
| `notifications` | Thông báo in-app |
| `notif_events` | Định nghĩa event type |
| `notif_templates` | Template nội dung theo kênh/role |
| `notif_subscriptions` | Preferences toggle của user |
| `notif_queue` | Hàng đợi gửi thông báo |
| `notif_delivery_log` | Log kết quả delivery |

### Security Model
- RLS (Row Level Security) trên tất cả bảng
- Pattern: `USING (school_id = (auth.jwt() ->> 'school_id')::uuid)`
- Auto-update triggers: `updated_at = now()` khi UPDATE
- Foreign key constraints với `ON DELETE CASCADE` / `ON DELETE SET NULL`

---

## 13. ROUTING MAP ĐẦY ĐỦ

```
/                    → RootRedirect (HomePage nếu guest, role route nếu authed)
/login               → LoginPage
/forgot-password     → ForgotPasswordPage
/unauthorized        → UnauthorizedPage (403)
*                    → NotFoundPage (404)

[ProtectedRoute → DashboardLayout]
/dashboard           → DashboardRedirect (theo role)
/profile             → ProfilePage (tất cả roles)
/notifications/settings → NotificationSettings (tất cả roles)

[RoleRoute: super_admin]
/superadmin          → SuperAdminDashboard

[RoleRoute: it_admin]
/it                  → ITDashboard

[RoleRoute: admin, staff]
/admin               → AdminDashboard
/admin/schools       → AdminSchoolsPage
/admin/users         → AdminUsersPage
/admin/roles         → AdminRolesPage
/admin/classes       → AdminClassesPage
/admin/reports       → AdminReportsPage
/admin/settings      → AdminSettingsPage

[RoleRoute: teacher]
/teacher             → TeacherDashboard
/teacher/classes     → TeacherClassesPage
/teacher/classes/:id → TeacherClassesPage (detail)
/teacher/attendance  → TeacherAttendancePage
/teacher/attendance/:classId → TeacherAttendancePage (for class)
/teacher/gradebook   → TeacherGradebookPage
/teacher/gradebook/:classId → TeacherGradebookPage (for class)
/teacher/schedule    → TeacherSchedulePage
/teacher/messages    → TeacherMessagesPage
/teacher/settings    → TeacherSettingsPage

[RoleRoute: parent]
/parent              → ParentDashboard
/parent/children     → ParentChildrenPage
/parent/attendance   → ParentAttendancePage
/parent/grades       → ParentGradesPage
/parent/assignments  → ParentAssignmentsPage
/parent/fees         → ParentFeesPage
/parent/messages     → ParentMessagesPage
/parent/notifications → ParentNotificationsPage

[RoleRoute: student]
/student             → StudentDashboard
/student/attendance  → StudentAttendancePage
/student/grades      → StudentGradesPage
/student/assignments → StudentAssignmentsPage
/student/schedule    → StudentSchedulePage
/student/classes     → StudentClassesPage
/student/classes/:id → StudentClassesPage (detail)
```

---

## 14. SIDEBAR NAVIGATION THEO ROLE

| Role | Menu items (tiếng Việt) |
|------|------------------------|
| `admin` | Tổng quan · Cơ sở · Người dùng · Phân quyền · Lớp học nhạc · Báo cáo · Cài đặt |
| `staff` | Tổng quan · Học viên · Tin nhắn |
| `teacher` | Tổng quan · Lớp của tôi · Điểm danh · Nhật ký tiến độ · Lịch dạy · Tin nhắn · Cài đặt |
| `parent` | Tổng quan · Con em · Điểm danh · Kết quả · Bài tập luyện · Học phí · Tin nhắn · Thông báo |
| `student` | Tổng quan · Điểm danh của tôi · Kết quả · Bài tập luyện · Lịch học · Lớp của tôi |
| `it_admin` | Tổng quan · Tích hợp · Khóa API · Nhật ký · Cập nhật |
| `super_admin` | Tổng quan · Cơ sở · Người dùng · Gói dịch vụ · Tính năng · Nhật ký · Cài đặt |

---

## 15. SCRIPTS & COMMANDS

```bash
npm run dev              # Dev server tại localhost:5173
npm run build            # Production build → dist/
npm run preview          # Preview production build
npm run lint             # ESLint (eslint.config.js)
npm run typecheck        # npx tsc --noEmit (zero output = không lỗi)
npm run create-users     # Tạo test users (scripts/create-test-users.ts)
npm run test-connection  # Kiểm tra kết nối Supabase (scripts/test-connection.ts)
```

---

## 16. TÀI KHOẢN TEST

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@admin.com | test1234 |
| Teacher | test@teacher.com | test1234 |
| Parent | test@parents.com | test1234 |
| Student | test@student.com | test1234 |

Database live trên Supabase cloud — không cần local DB.

---

## 17. TRẠNG THÁI HIỆN TẠI

| Module | Status | Ghi chú |
|--------|--------|---------|
| Auth (đăng nhập/đăng xuất/reset) | ✅ Hoàn chỉnh | Supabase Auth |
| RBAC + Capability system | ✅ Hoàn chỉnh | 7 roles, guards đầy đủ |
| Multi-tenancy + RLS | ✅ Hoàn chỉnh | 36+ bảng có RLS |
| Attendance CRUD | ✅ Hoàn chỉnh | Service + hooks |
| In-app Notifications | ✅ Hoàn chỉnh | Bell, dropdown, settings |
| YayaMusic UI (tất cả 33 trang) | ✅ Hoàn chỉnh | Classical European design |
| Landing page + MusicNotesBackground | ✅ Hoàn chỉnh | Nốt nhạc floating + mouse parallax |
| Việt hóa toàn bộ UI | ✅ Hoàn chỉnh | Tiếng Việt, locale VN |
| Messaging contact list | ✅ Hoạt động | Teacher↔Student/Parent, Parent↔Teacher |
| Avatar upload | ✅ Hoạt động | Supabase Storage bucket `avatars` |
| Gradebook UI | 🔄 Placeholder | Khung UI có, logic chưa đầy đủ |
| Direct messaging (gửi/nhận) | 🔄 Placeholder | Contact list OK, gửi tin cần phát triển |
| Fee Management | 🔄 Placeholder | UI khung, chưa nối backend |
| Email/SMS/Push Notifications | 🔄 Chưa triển khai | Edge Functions có sẵn |
| Analytics nâng cao | 🔄 Chưa triển khai | — |

---

## 18. LOADING STATES & ERROR HANDLING

### `LoadingSkeleton` (`shared/components/LoadingSkeleton.tsx`)
- `<LoadingSkeleton />` — Generic skeleton
- `<CardSkeleton />` — Card skeleton
- `<TableSkeleton />` — Table rows skeleton
- `<DashboardSkeleton />` — Full dashboard layout skeleton
- Màu skeleton: `bg-gold/20 animate-pulse`

### Error Handling
- `<ErrorBoundary />` — React error boundary, catch render errors
- `apiClient.ts` — Wrapper cho Supabase calls với error handling chuẩn hóa
- `loggingService.ts` — Log errors ra console (extensible cho external service)
- Pages 403 (`UnauthorizedPage`) và 404 (`NotFoundPage`)

---

## 19. AVATAR & PROFILE

### Upload flow (`avatarService.ts`)
1. Validate: file size ≤ 5MB, type trong `['image/jpeg', 'image/jpg', 'image/png', 'image/webp']`
2. Tạo path: `{schoolId}/{userId}_{timestamp}.{ext}`
3. `supabase.storage.from('avatars').upload(filePath, file, { upsert: true })`
4. Lấy public URL: `supabase.storage.from('avatars').getPublicUrl(filePath)`
5. Return: `{ url: string, path: string }`

### Bucket setup
Migration `20260118130000` tạo bucket `avatars` với public access cho GET.

---

## 20. FEATURE FLAGS

```ts
// src/shared/utils/featureFlags.ts
// Hook: const isEnabled = useFeature('feature-name')
// Đọc feature flags từ tenant subscription tier
// Cho phép bật/tắt tính năng per-school
```

---

## 21. MIGRATIONS SUPABASE (thứ tự áp dụng)

| Migration | Nội dung |
|-----------|----------|
| `20260118105004_create_education_crm_schema.sql` | Core: schools, users, roles, academic, attendance |
| `20260118110059_create_notification_system_tables.sql` | Notification tables |
| `20260118111811_add_multi_tenancy_enhancements.sql` | RLS policies, multi-tenancy |
| `20260118113637_fix_security_and_performance_issues.sql` | Security + index fixes |
| `20260118114526_remove_unused_indexes_and_fix_security.sql` | Cleanup |
| `20260118120000_fix_user_profiles_rls_recursion.sql` | Fix RLS infinite recursion |
| `20260118121000_update_philippines_defaults.sql` | Locale defaults (đã áp dụng cho VN) |
| `20260118130000_create_avatars_storage_bucket.sql` | Storage bucket `avatars` |

### Cách chạy migrations
**Cách 1 — Supabase CLI:**
```bash
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push
```
**Cách 2 — SQL Editor trên dashboard.supabase.com:** Chạy từng file theo thứ tự trên.

---

## 22. GHI CHÚ KỸ THUẬT

1. **Text hardcoded** — Không có i18n library. Toàn bộ text tiếng Việt inline trong JSX.
2. **Custom Tailwind tokens** — `tailwind.config.js` mở rộng `theme.extend`. KHÔNG hardcode hex color trong className.
3. **Locale VN** — `locale.ts` đã cập nhật: `Asia/Ho_Chi_Minh`, VNĐ, `DD/MM/YYYY`, 24h, `+84`.
4. **No component library** — Toàn bộ UI viết từ đầu với Tailwind utilities.
5. **Supabase JWT claims** — `school_id` và `user_type` trong JWT payload (dùng để RLS).
6. **Mobile responsive** — Sidebar tự collapse trên mobile (translate-x), MobileNav bottom bar riêng.
7. **TypeScript strict** — `npx tsc --noEmit` phải ra 0 lỗi. Type narrowing quan trọng: dùng `if (!school)` thay `if (!school?.id)` để narrow trong async closures.
8. **Domain rules** — Không sửa business logic trong `domains/` (services, hooks, contexts, types, Supabase calls). Chỉ sửa UI layer trong `pages/`, `layouts/`, `shared/components/`.

---

## 23. DỊCH THUẬT DOMAIN ÂM NHẠC

| Tiếng Anh | Tiếng Việt |
|-----------|-----------|
| Student(s) | Học viên |
| Teacher(s) | Giảng viên |
| Classes | Lớp học nhạc |
| Attendance | Điểm danh |
| Gradebook | Nhật ký tiến độ |
| Assignments | Bài tập luyện |
| Schedule | Lịch học |
| Reports | Báo cáo |
| Settings | Cài đặt |
| Dashboard | Tổng quan |
| Messages | Tin nhắn |
| Fees | Học phí |
| Roles | Phân quyền |
| School(s) | Cơ sở / Trung tâm |
| Staff | Nhân viên |
| Enrollment | Đăng ký học |
| Present | Có mặt |
| Absent | Vắng mặt |
| Late | Đi trễ |
| Excused | Có phép |
| Grade | Điểm / Kết quả |
| Sign in | Đăng nhập |
| Sign out | Đăng xuất |
| Profile | Hồ sơ |
| Notifications | Thông báo |
| Integrations | Tích hợp |
| Feature Flags | Quản lý tính năng |
| Subscriptions | Gói dịch vụ |

---

## 24. DEPLOY

- **Frontend:** Vercel (`vercel.json` cấu hình sẵn, SPA fallback routes)
- **Database:** Supabase cloud (PostgreSQL + Auth + Storage + Edge Functions)
- **Build:** `npm run build` → `dist/` (Vite, ~1600 modules, ~4-5s)
- **Environment variables cần thiết:**
  ```
  VITE_SUPABASE_URL=https://xxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJ...
  ```
