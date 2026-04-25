# YayaMusic — Project Context for Agents

## Project Name
**YayaMusic** — Phần mềm quản lý trung tâm đào tạo âm nhạc (Vietnam)

## Tech Stack
- React 18 + TypeScript + Vite 5 + Tailwind CSS 3.4 + Supabase JS 2
- React Router DOM 7 | Lucide React icons

## Architecture — DDD
```
src/
├── domains/          # Business logic (DO NOT modify services/hooks/contexts)
│   ├── auth/
│   ├── academic/     # attendance components here
│   └── communication/ # notification components here
├── pages/            # UI only — admin/ teacher/ parent/ student/ auth/ public/ common/
├── layouts/          # DashboardLayout, Sidebar, Header, MobileNav, LandingNav
├── shared/
│   ├── components/   # Guards, LoadingSkeleton, ErrorBoundary
│   └── utils/        # locale.ts, featureFlags.ts
├── contexts/         # TenantContext, AuthContext, UserContext
├── hooks/            # useApiRequest, useFeature
└── types/            # tenant.ts
```

## Design System — YayaMusic Classical European
All design tokens are in `tailwind.config.js` — USE THESE, do not hardcode colors:
- `text-primary` / `bg-primary` — burgundy #6B2D3E (CTAs, active nav)
- `text-gold` / `bg-gold` — #C9A84C (accents, highlights)
- `bg-cream` — #F8F4E9 (page background)
- `bg-cream-dark` — #EDE8D5 (card background, sidebar)
- `text-navy` — #1B2A4A (headings)
- `text-charcoal` — #2C3E50 (body text)

Fonts (loaded via Google Fonts in index.html):
- `font-display` → Playfair Display (headings h1–h3)
- `font-body` → Be Vietnam Pro (body, labels)
- `font-accent` → EB Garamond (quotes, captions)

## Language
**Tiếng Việt** — all UI text must be in Vietnamese. Text is hardcoded (no i18n library).
See translation table in docs/PROJECT_KNOWLEDGE.md § "Dịch thuật domain âm nhạc".

## Locale
Vietnam — `Asia/Ho_Chi_Minh`, VND (₫), DD/MM/YYYY, 24h clock, +84

## RBAC — 7 Roles
`super_admin | it_admin | admin | staff | teacher | parent | student`
Capability format: `resource:action` (e.g. `student:read`, `attendance:mark`)
Guards: `ProtectedRoute`, `RoleRoute`, `CapabilityRoute` — DO NOT change these.

## Rules for Agents
1. **DO NOT modify** business logic: services, hooks, contexts, types, Supabase calls
2. **DO NOT change** route paths (`/admin`, `/teacher`, `/parent`, `/student`)
3. **DO NOT change** RBAC/Capability system or guard components
4. **DO NOT add** i18n library — translate text inline in JSX
5. Only translate/redesign **JSX/TSX UI layer**

## Full Documentation
`docs/PROJECT_KNOWLEDGE.md` — 26 sections: all pages, components, DB schema, routing

## Test Accounts
Credentials are managed in Supabase (see docs/OVERVIEW.md). Database is live on Supabase cloud.

---

## ⚠️ Lessons Learned — NEVER FORGET

### DB Schema — Tên cột đúng
| Bảng | Cột SAI | Cột ĐÚNG |
|------|---------|----------|
| `students` | `code` | `student_code` |
| `attendance_records` | `date` | `attendance_date` |
| `attendance_records` | _(thiếu)_ | `school_id` NOT NULL — luôn phải include |

- upsert `onConflict`: `'class_id,student_id,attendance_date'` (không phải `date`)
- `user_profiles.id` ≠ `students.id` → phải lookup: `students WHERE user_id = profile.id`

### RLS Policies — KHÔNG dùng JWT claims
- `auth.jwt()->>'school_id'` **KHÔNG HOẠT ĐỘNG** trong Supabase (không có trong JWT mặc định)
- Thay bằng: `JOIN user_profiles WHERE id = auth.uid() AND school_id = table.school_id`
- Xem migration `20260427000000_fix_attendance_and_sessions_rls.sql` làm mẫu

### Migrations — TỰ CHẠY, không hỏi user
- `supabase db push` **KHÔNG DÙNG** — replay toàn bộ lịch sử, fail khi trigger đã tồn tại
- Dùng **Supabase Management API** để chạy SQL trực tiếp:
```bash
node -e "
const fs = require('fs'), https = require('https');
const sql = fs.readFileSync('supabase/migrations/MIGRATION_FILE.sql', 'utf8');
const body = JSON.stringify({ query: sql });
const opts = { hostname: 'api.supabase.com', path: '/v1/projects/xpzxbsgkxtrcgliyavqs/database/query', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sbp_83d3316791d6d601febbe3c32c343dda0c36109e', 'Content-Length': Buffer.byteLength(body) } };
const req = https.request(opts, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>console.log(res.statusCode, d)); });
req.write(body); req.end();
"
```
- HTTP 201 = thành công. Luôn tự chạy sau khi tạo file migration.

### Edge Functions — KHÔNG triển khai
- `attendanceService.ts`, `classSessionService.ts` gọi Edge Functions CHƯA DEPLOY
- Khi gặp "Network error: Unable to reach server" → bypass hoàn toàn, dùng Supabase JS client trực tiếp trong component
