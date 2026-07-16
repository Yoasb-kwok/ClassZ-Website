# ClassZ Website — Centre Admin Web Technical Specification

**Version:** 1.1.0 (implemented baseline)  
**Scope:** Centre Admin Web (`center_admin`) in ClassZ-website + `/api/center/*` in classz-api  
**Out of scope:** Platform Admin, Parent app, Coach app

---

## 1. Architecture

```
ClasszAdminGate → ClasszAdminShell (center-admin-nav)
  → /admin/* managers
  → lib/classz-api-client → /api proxy → classz-api /api/center/*
  → Neon PostgreSQL (center_id tenant isolation)
```

| Layer | Stack |
|-------|--------|
| Frontend | Next.js App Router, React, TypeScript, Tailwind |
| Auth | JWT in `classz_session` (`role=center_admin`, `center_id`) |
| API | Express `/api/center/*` + `requireCenterPortalAccess` |
| DB | PostgreSQL (Neon) via pgMysqlCompat |

---

## 2. Navigation (IA)

Source: [`lib/center-admin-nav.ts`](../lib/center-admin-nav.ts)

| Group | Route | Module |
|-------|-------|--------|
| Overview | `/admin` | Dashboard KPIs |
| People | `/admin/students` | Students |
| People | `/admin/teachers` | Teachers |
| Operations | `/admin/schedule` | Schedule |
| Operations | `/admin/programs` | Courses |
| Operations | `/admin/bookings` | Bookings / waitlist / refunds |
| Operations | `/admin/attendance` | Attendance |
| Operations | `/admin/feedback` | Academic Learning Record |
| Finance | `/admin/finance` | Orders, outstanding, coupons, revenue |
| Growth | `/admin/crm` | Lead pipeline + follow-ups |
| Growth | `/admin/marketing` | Campaigns, AI, broadcast |
| Insights | `/admin/reports` | Report hub |

Platform CRM still uses the 4-step horizontal nav under `/admin/center-crm/:id/*`.

---

## 3. Dashboard KPIs

`GET /api/center/dashboard/kpis` (centre-scoped)

| Widget | Field |
|--------|--------|
| Today's Revenue | `todayRevenue` |
| Today's Attendance | `todayAttendancePresent` / `todayAttendanceScheduled` |
| Active Students | `activeStudents` (30d) |
| New Leads | `newLeads` (trials + crm_leads today) |
| Outstanding Payments | `outstandingPayments` |
| Teacher Utilization | `teacherUtilization` (%) |
| Upcoming Classes | `upcomingClasses[]` |

UI: [`components/admin/centre-dashboard.tsx`](../components/admin/centre-dashboard.tsx)

---

## 4. Module → API map

### Students
- List/edit: `GET/PATCH /users`
- Timeline / progress / invoices / transfer: `/students/:id/*`
- Medical notes: `PATCH /student-profiles/:id/medical-notes`
- Parent notes: `GET/POST /users/:userId/notes`

### Teachers
- Profile: `GET/POST/PATCH /instructors`
- Availability: `GET/PUT /instructors/:id/availability`
- Payroll: `GET/POST /payroll`
- Performance: `GET /instructor-performance`

### Bookings
- Requests: `GET/PATCH /enrollment-requests`
- Waitlist: `GET/POST/PATCH /waitlist`
- Refunds: `GET/POST /refund-records`

### Finance
- Orders: `GET /orders`
- Coupons: `GET /coupons`
- Revenue: `GET /reports/revenue`

### CRM
- Leads: `GET/POST/PATCH /leads`
- Follow-ups: `GET/POST /leads/:id/follow-ups`
- Funnel: `GET /conversion-funnel`

### Marketing
- Campaigns: `GET/POST/PATCH /marketing/campaigns`
- AI stub: `POST /marketing/ai-generate`
- WhatsApp / Email (consent required): `POST /marketing/whatsapp`, `POST /marketing/email`

### Reports
- Attendance, churn, instructor, conversion (existing)
- Popular courses: `GET /reports/popular-courses`

### Courses (extended)
- `age_min`, `age_max`, `default_instructor_id`, `price` on create/patch

---

## 5. New database tables

Migration: `npm run db:migrate:centre-crm`  
Script: [`classz-api/scripts/run-centre-crm-tables-migration.js`](../../classz-api/scripts/run-centre-crm-tables-migration.js)

- `class_waitlist`
- `crm_leads`, `crm_follow_ups`
- `user_notes`
- `instructor_availability`, `instructor_payroll_runs`
- `marketing_campaigns`, `marketing_broadcasts`
- Alters: `trial_applications.center_id`, `profiles.medical_notes`, `courses.age_*`, `courses.default_instructor_id`

All CRM tables include `center_id`.

---

## 6. Multi-tenancy rules

1. Centre JWT sets `req.centerTenantId`
2. Controllers use `getScopedCenterId(req)` / `requireScopedCenterId`
3. Scoped: dashboard, KPIs, trials (via class), enrollment-requests, conversion funnel orders/enrollments, all new CRM APIs
4. Never trust client `center_id` without matching JWT scope

---

## 7. Compliance (marketing)

- WhatsApp / Email broadcast require `consent: true` (PDPO opt-in)
- Broadcasts are **queued stubs** until Twilio / SMTP production config
- AI content generator returns template copy until LLM provider is wired

---

## 8. Local setup

```powershell
# Terminal 1
cd classz-api
npm run db:migrate:centre-crm
npm start

# Terminal 2
cd ClassZ-website
npm run dev
```

Seed centre login: `center@demo.com` / `111111` (or your seeded credentials).

---

## 9. Feature matrix (post-implementation)

| Module | Status |
|--------|--------|
| Dashboard (7 KPIs) | Implemented |
| Students (search/edit/history/notes/transfer/medical/invoices) | Implemented |
| Teachers (profile/availability/payroll/performance) | Implemented |
| Schedule / Attendance / Feedback | Pre-existing |
| Courses (+ age/price/teacher) | Extended |
| Bookings + waitlist + refunds UI | Implemented |
| Finance hub | Implemented |
| CRM pipeline | Implemented |
| Reports hub | Implemented |
| Marketing (+ AI stub + broadcast consent) | Implemented |
