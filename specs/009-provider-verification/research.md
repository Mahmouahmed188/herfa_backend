# Research: Provider Verification System

## Overview

Research conducted to resolve implementation unknowns and document best-practice decisions for the Provider Verification System.

---

## 1. Existing Verification Infrastructure

### Current State
- A `TechnicianVerification` entity exists in `src/entities/technician-verification.entity.ts` with a simple `VerificationStatus` enum (pending, approved, rejected).
- A `VerificationModule` at `src/modules/verification/` handles basic submit/status/review flows.
- `ProviderProfile` already has a `verificationStatus` field (string, default `'pending'`).
- `ProviderVerificationStatus` enum exists in `common/constants/user.enums.ts` (pending, submitted, verified, rejected).

### Decision
Create a **new, independent** `ProviderVerificationModule` rather than extending the existing verification system. Rationale:
- The existing system is technician-oriented with a flat document structure (front/back ID, personal photo).
- The new system requires full document management (multiple types, upload/delete), immutable history, and admin workflow (approve/reject/suspend/reactivate) — significantly different scope.
- Both systems can coexist, serving different user types.

---

## 2. Notification Integration

### Event Pattern
The project uses `@nestjs/event-emitter` (`EventEmitter2`) with dot-separated event names: `domain.eventname`.

**Payload convention** (preferred, from bookings/reviews):
```typescript
{
  event: 'verification.submitted',
  timestamp: '2026-06-05T10:00:00.000Z',
  data: {
    verificationId: 'uuid',
    providerId: 'uuid',
    providerName: 'string',
    status: 'under_review',
  },
}
```

**Existing notification types** in `NotificationType` enum:
- `ACCOUNT_VERIFIED = 'account_verified'`
- `ACCOUNT_SUSPENDED = 'account_suspended'`

**New types needed** (to add to enum):
- `VERIFICATION_SUBMITTED = 'verification_submitted'`
- `VERIFICATION_APPROVED = 'verification_approved'`
- `VERIFICATION_REJECTED = 'verification_rejected'`
- `VERIFICATION_SUSPENDED = 'verification_suspended'`
- `VERIFICATION_REACTIVATED = 'verification_reactivated'`

### Decision
Emit events using the wrapped `{ event, timestamp, data }` convention. Add a dedicated `VerificationEventsHandler` in the notifications module (following the existing `AccountEventsHandler` pattern).

---

## 3. Audit Logging

### Current State
An `AuditService` exists in `src/modules/payments/services/audit.service.ts` that logs to the `audit_logs` table via TypeORM.

### Decision
Create a **feature-specific** `AuditService` inside the ProviderVerification module (following the payments module pattern), reusing the same `AuditLog` entity. This keeps cross-cutting services scoped to their feature module.

---

## 4. File Storage Abstraction

### Current State
- Uploads go to local disk (`./uploads/`) via `multer` `diskStorage`.
- No abstraction layer exists.
- A config comment in the uploads controller notes: "In production, this would be a full URL (e.g., from S3)."

### Decision
Define a `StorageProvider` interface in `src/common/interfaces/storage-provider.interface.ts`:
```typescript
export interface StorageProvider {
  upload(file: Express.Multer.File, path: string): Promise<string>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
}
```

Provide a default `LocalStorageProvider` implementation using multer disk storage. This allows future S3/R2/Supabase providers without changing verification module code. The verification document service will depend on this interface.

---

## 5. Prisma Schema & TypeORM Coexistence

### Current State
- Both TypeORM entities and Prisma schema are maintained.
- TypeORM entities are the source of truth for runtime operations.
- Prisma schema mirrors the entities for migration generation.

### Decision
- Add TypeORM entities: `ProviderVerification`, `VerificationDocument`, `VerificationHistory` in `src/entities/`.
- Mirror these in `prisma/schema.prisma` with snake_case table names and UUID columns.
- Add a native Prisma enum `verification_status_enum` for status values.
- Generate migration via Prisma after both are defined.

---

## 6. Verification Status State Machine

### Status Values
```
pending → under_review → approved
                        → rejected → under_review (resubmit)
                        → suspended → approved (reactivate)
```

### Allowed Transitions
| From → To | Allowed? | Trigger |
|-----------|----------|---------|
| pending → under_review | Yes | Provider submits |
| under_review → approved | Yes | Admin approves |
| under_review → rejected | Yes | Admin rejects (reason required) |
| rejected → under_review | Yes | Provider resubmits |
| approved → suspended | Yes | Admin suspends (reason required) |
| suspended → approved | Yes | Admin reactivates |

---

## 7. Provider Search Visibility

### Current State
- `ProviderProfile.verificationStatus` is a string field.
- No existing filter for "only approved providers" in search.

### Decision
- The Provider Verification module will update `ProviderProfile.verificationStatus` on status changes (approved/rejected/suspended/reactivated).
- Provider listing/search queries must filter by `verificationStatus = 'approved'`.
- This is a lightweight coupling: update one field on the related profile.

---

## 8. Key Dependencies & Versions

| Dependency | Version (from package.json) | Purpose |
|-----------|---------------------------|---------|
| @nestjs/common | ^10.x | NestJS core |
| @nestjs/typeorm | ^10.x | TypeORM integration |
| typeorm | ^0.3.x | ORM |
| pg | ^8.x | PostgreSQL driver |
| class-validator | ^0.14.x | DTO validation |
| class-transformer | ^0.5.x | Object transformation |
| @nestjs/swagger | ^7.x | API documentation |
| @nestjs/jwt | ^10.x | JWT auth |
| @nestjs/passport | ^10.x | Passport integration |
| multer | ^1.4.x | File upload handling |
| @nestjs/event-emitter | ^2.x | Event-driven notifications |
| uuid | ^9.x | UUID generation |

---

## 9. Naming Conventions

| Convention | Standard |
|-----------|----------|
| Table names | snake_case, plural (`provider_verifications`) |
| Column names | snake_case in DB, camelCase in entities |
| Entity classes | PascalCase (`ProviderVerification`) |
| DTO classes | PascalCase with suffix (`SubmitVerificationDto`) |
| Routes | kebab-case (`/provider-verification/submit`) |
| Event names | dot-separated (`verification.submitted`) |
| Controller files | kebab-case (`provider-verification.controller.ts`) |

---

## 10. Testing Strategy

| Test Type | Approach |
|-----------|----------|
| Unit tests | Jest + @nestjs/testing. Mock TypeORM repositories. Test each service method in isolation. |
| E2E tests | Supertest + full AppModule. Test complete API endpoints with real DB (test container or SQLite). |

### Unit test coverage targets:
- `ProviderVerificationService`: 100% of status transition logic
- `ProviderVerificationAdminService`: 100% of admin action methods
- `DocumentService`: Upload, delete, list operations
- `HistoryService`: Append-only history recording
- `AuditService`: Audit log creation
- `VerificationOwnerGuard`: Authorization logic

---

## 11. Security Considerations

- JWT authentication on all endpoints.
- Admin-only guards on all admin endpoints (`@Roles(UserRole.ADMIN)` + `RolesGuard`).
- Provider ownership guard (`VerificationOwnerGuard`) to ensure providers only access their own verification data.
- Self-approval prevention: block if `reviewedBy === providerId`.
- Input validation via DTOs with class-validator (whitelist + forbidNonWhitelisted).
- File validation: accept only `jpg`, `jpeg`, `png`, `pdf`; limit 10MB.
- Audit logs are append-only, preventing tampering.
