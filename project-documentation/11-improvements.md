# SmileOS — Improvements & Future Work

## Current Gaps & Known Issues

### 1. Security — RBAC Not Enforced

**Status:** Defined but not implemented

The `src/lib/permissions.ts` file defines 4 roles with granular permissions, but server actions do not check permissions before executing. Any authenticated user can perform any action.

**Fix needed:**
- Add permission checks at the start of every server action
- Use `getSession()` from Better Auth to get current user role
- Check `hasPermission(role, "patients:write")` before mutations
- Return 403 Forbidden if unauthorized

**Priority:** High

---

### 2. Security — No Rate Limiting

**Status:** Not implemented

Server actions have no throttling. A user could spam create/delete operations.

**Fix needed:**
- Add rate limiting middleware
- Use Upstash Redis or similar for distributed rate limiting
- Limit: 100 requests/minute for reads, 20 requests/minute for writes

**Priority:** High

---

### 3. Security — No CSRF Protection

**Status:** Partial (Better Auth handles session tokens)

Server actions are vulnerable to CSRF if session tokens are not properly validated.

**Fix needed:**
- Verify Better Auth CSRF protection is active
- Add origin checking for server actions

**Priority:** Medium

---

### 4. Audit Logging Not Used

**Status:** Models exist (`ActivityLog`, `AuditLog`) but nothing writes to them

**Fix needed:**
- Create audit logging middleware
- Log all create/update/delete operations
- Store old/new values for compliance
- Add audit log viewer in admin settings

**Priority:** Medium

---

### 5. AI Features Are Simulated

**Status:** Pattern-based responses, no LLM integration

The AI diagnosis, treatment planning, and schedule optimization use hardcoded patterns, not actual machine learning or LLM calls.

**Fix needed:**
- Integrate OpenAI/Claude API for real AI responses
- Add streaming responses for chat
- Implement RAG (Retrieval-Augmented Generation) with patient data
- Add AI response caching
- Add cost tracking for API calls

**Priority:** Medium (functional as demo, but not production-ready)

---

### 6. No Email/SMS Integration

**Status:** Resend configured but not used

Notification models exist but no actual sending happens.

**Fix needed:**
- Implement Resend for email notifications
- Add Twilio for SMS
- Add WhatsApp Business API
- Implement push notifications (Web Push API)
- Add notification preferences per user

**Priority:** High (for production)

---

### 7. No File Upload

**Status:** Document references exist but no upload mechanism

`PatientDocument` and `MedicalRecord` have `fileUrl` fields but no upload functionality.

**Fix needed:**
- Add file upload to Supabase Storage or S3
- Implement drag-and-drop upload
- Add file type validation (PDF, images, DICOM)
- Add file size limits
- Add image preview for photos

**Priority:** Medium

---

### 8. No Real-Time Updates

**Status:** Polling-based (30s refresh for notifications)

**Fix needed:**
- Implement WebSocket connections (Socket.io or Supabase Realtime)
- Real-time appointment updates
- Real-time notification delivery
- Real-time chat in AI assistant
- Presence indicators for staff

**Priority:** Low (polling works for MVP)

---

### 9. No Testing

**Status:** No test files exist

**Fix needed:**
- Unit tests for server actions (Jest/Vitest)
- Component tests (React Testing Library)
- E2E tests (Playwright/Cypress)
- Database tests (Prisma testcontainers)
- Target: 80% code coverage

**Priority:** High (for production)

---

### 10. No CI/CD Pipeline

**Status:** No GitHub Actions or deployment config

**Fix needed:**
- GitHub Actions for lint, typecheck, test, build
- Preview deployments (Vercel)
- Production deployment pipeline
- Database migration automation
- Environment variable management

**Priority:** High (for production)

---

## Feature Improvements

### 11. Patient Portal Enhancements

**Current:** Basic read-only views

**Improvements:**
- Online appointment booking (check availability, select time slot)
- Online payment processing (Stripe integration)
- Secure messaging with dentist
- Document upload (insurance cards, medical records)
- Treatment plan approval workflow
- Appointment reminders (email/SMS)

**Priority:** Medium

---

### 12. Advanced Reporting

**Current:** Basic stats cards and charts

**Improvements:**
- Revenue reports (daily, weekly, monthly, yearly)
- Patient acquisition reports
- Treatment popularity reports
- Staff performance reports
- Appointment no-show reports
- Export to PDF/Excel
- Scheduled report emails

**Priority:** Medium

---

### 13. Multi-Clinic Support

**Current:** Single clinic seeded

**Improvements:**
- Multi-clinic dashboard (switch between clinics)
- Cross-clinic patient transfer
- Centralized billing across clinics
- Clinic-specific settings and branding
- Multi-location scheduling

**Priority:** Low

---

### 14. Patient Communication

**Current:** Notification model exists but no sending

**Improvements:**
- Automated appointment reminders (24h, 1h before)
- Birthday/anniversary messages
- Treatment follow-up emails
- Insurance renewal reminders
- Marketing campaigns (bulk email/SMS)
- Two-way SMS chat

**Priority:** High

---

### 15. Insurance Management

**Current:** Basic insurance info storage

**Improvements:**
- Insurance claim generation (ADA dental claim form)
- Claim submission integration
- Insurance verification
- Coverage estimation before treatment
- EOB (Explanation of Benefits) processing
- Insurance aging reports

**Priority:** Medium

---

### 16. Clinical Features

**Current:** Basic consultations and prescriptions

**Improvements:**
- Dental charting (tooth-by-tooth diagram)
- Treatment planning workflow
- Progress notes with voice-to-text
- Before/after photo comparison
- Lab order management
- Prescription printing (controlled substance support)

**Priority:** Medium

---

### 17. Accessibility (WCAG)

**Current:** Basic semantic HTML

**Improvements:**
- ARIA labels on all interactive elements
- Keyboard navigation for all features
- Screen reader testing
- Color contrast compliance
- Focus management in dialogs
- Skip navigation links

**Priority:** High (legal requirement in many jurisdictions)

---

### 18. Performance Optimization

**Current:** Basic Next.js optimizations

**Improvements:**
- Image optimization (next/image for avatars, documents)
- Virtual scrolling for large lists (react-window)
- API response caching (Redis)
- Database query optimization (Prisma `$transaction`, batch queries)
- Bundle analysis and code splitting
- Lazy loading for below-fold content

**Priority:** Medium

---

### 19. Internationalization (i18n)

**Current:** English only

**Improvements:**
- Next.js i18n routing
- Translation files (JSON)
- RTL support for Arabic/Hebrew
- Date/time localization
- Currency localization
- Number formatting

**Priority:** Low

---

### 20. Mobile App

**Current:** Responsive web only

**Improvements:**
- React Native mobile app
- Push notifications
- Offline support
- Camera integration (before/after photos)
- Biometric authentication
- Appointment check-in via QR code

**Priority:** Low

---

## Technical Debt

| Item | Impact | Effort |
|------|--------|--------|
| RBAC enforcement | High security gap | Medium |
| Add testing suite | No safety net | High |
| Fix `startTime`/`endTime` to DateTime | Current string format causes sorting issues | Medium |
| Add database migrations | Using `db push` instead of proper migrations | Low |
| Remove unused models | ActivityLog, AuditLog, BlogPost, GalleryImage exist but aren't used | Low |
| Consolidate date handling | Mix of Date objects and strings | Medium |
| Add API documentation | No OpenAPI/Swagger | Low |

---

## Priority Roadmap

### Phase 7: Testing & Quality (Next)
- [ ] Unit tests for server actions
- [ ] Component tests for key UI
- [ ] E2E tests for critical flows
- [ ] RBAC enforcement in server actions
- [ ] Accessibility audit

### Phase 8: Deployment
- [ ] Vercel deployment
- [ ] GitHub Actions CI/CD
- [ ] Environment variable management
- [ ] Sentry error tracking setup
- [ ] PostHog analytics setup

### Phase 9: Production Features
- [ ] Email notifications (Resend)
- [ ] SMS notifications (Twilio)
- [ ] File upload (Supabase Storage)
- [ ] Rate limiting
- [ ] Audit logging

### Phase 10: AI Integration
- [ ] LLM integration (OpenAI/Claude)
- [ ] Streaming responses
- [ ] RAG with patient data
- [ ] Real diagnosis suggestions
- [ ] Cost tracking

### Phase 11: Patient Portal v2
- [ ] Online booking
- [ ] Online payments (Stripe)
- [ ] Secure messaging
- [ ] Document upload
- [ ] Treatment plan approval

### Phase 12: Advanced Features
- [ ] Dental charting
- [ ] Insurance claims
- [ ] Advanced reporting
- [ ] Multi-clinic support
- [ ] Mobile app
