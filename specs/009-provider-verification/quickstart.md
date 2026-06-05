# Quickstart: Provider Verification System

## Prerequisites

- Node.js >= 18
- PostgreSQL with `uuid-ossp` extension enabled
- Redis (for Bull queues, if notifications use queues)
- NestJS project at `D:\project\Antigravity_work_Space\Herfa_app\backend`

## Implementation Order

Follow this exact sequence (Constitution Principle XV):

### Step 1: Add Entities

Create three TypeORM entity files in `src/entities/`:
- `provider-verification.entity.ts`
- `verification-document.entity.ts`
- `verification-history.entity.ts`

### Step 2: Update Prisma Schema

Add corresponding models to `prisma/schema.prisma`:
- `provider_verifications`
- `verification_documents`
- `verification_history`
- Enum: `verification_status_enum`

### Step 3: Generate Migration

```bash
npx prisma migrate dev --name add_provider_verification --create-only
npx prisma migrate dev
```

### Step 4: Create Storage Interface

Add `src/common/interfaces/storage-provider.interface.ts` with the `StorageProvider` interface and default `LocalStorageProvider` implementation.

### Step 5: Create DTOs

In `src/modules/provider-verification/dto/`:
1. `submit-verification.dto.ts`
2. `verification-status-response.dto.ts`
3. `upload-document.dto.ts`
4. `verification-documents-response.dto.ts`
5. `admin-verification-filter.dto.ts`
6. `admin-verification-response.dto.ts`
7. `approve-verification.dto.ts`
8. `reject-verification.dto.ts`
9. `suspend-reactivate.dto.ts`

Each with class-validator rules and @ApiProperty decorators.

### Step 6: Create Module

```bash
nest g module provider-verification
```

Wire up TypeORM repositories, controllers, and services.

### Step 7: Create Services

- `ProviderVerificationService` — provider-facing operations
- `ProviderVerificationAdminService` — admin operations
- `DocumentService` — file upload/delete/document management
- `HistoryService` — append-only history recording
- `AuditService` — audit log creation (reuse AuditLog entity)

### Step 8: Create Controllers

- `ProviderVerificationController` — provider endpoints
- `ProviderVerificationAdminController` — admin endpoints

### Step 9: Create Guards

- `VerificationOwnerGuard` — ensures provider can only access own data

### Step 10: Add Swagger

Decorate all DTOs and controllers with full Swagger documentation as specified in the contract.

### Step 11: Add Notification Events

1. Add new notification types to `NotificationType` enum in `common/constants/user.enums.ts`.
2. Create `VerificationEventsHandler` in notifications module (following `AccountEventsHandler` pattern).
3. Register handler in `NotificationsModule`.

### Step 12: Add to AppModule

Import `ProviderVerificationModule` in `app.module.ts`.

### Step 13: Write Unit Tests

Create test files in `test/unit/provider-verification/`:
- `provider-verification.service.spec.ts`
- `provider-verification-admin.service.spec.ts`
- `document.service.spec.ts`
- `history.service.spec.ts`
- `audit.service.spec.ts`

### Step 14: Create E2E Tests

Create `test/integration/provider-verification.e2e-spec.ts`.

### Step 15: Manual Verification

1. Start the server: `npm run start:dev`
2. Access Swagger UI: `http://localhost:3000/api/docs`
3. Verify provider endpoints:
   - Register as provider → upload documents → submit → check status
4. Verify admin endpoints:
   - Login as admin → list verifications → view details → approve/reject

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/entities/provider-verification.entity.ts` | Verification entity |
| `src/entities/verification-document.entity.ts` | Document entity |
| `src/entities/verification-history.entity.ts` | History entity |
| `src/common/interfaces/storage-provider.interface.ts` | Storage abstraction |
| `src/modules/provider-verification/` | Feature module |
| `src/modules/notifications/handlers/verification-events.handler.ts` | Event handler |

## Common Commands

```bash
# Run unit tests
npx jest --testPathPattern="provider-verification"

# Run e2e tests
npx jest --config test/jest-e2e.json --testPathPattern="provider-verification"

# Generate migration
npx prisma migrate dev --name add_provider_verification

# Start dev server
npm run start:dev
```

## Integration Points

| Module | Integration Type | Details |
|--------|-----------------|---------|
| Provider Profiles | Direct DB write | Update `verificationStatus` on status change |
| Auth/Users | Guard | JWT auth + role verification |
| Notifications | Event emitter | Emit on status changes |
| Audit Logging | Direct DB write | Log all critical actions |
| File Storage | Interface | StorageProvider interface + LocalStorageProvider |
