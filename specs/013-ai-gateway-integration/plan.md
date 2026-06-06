# Implementation Plan: AI Gateway & Integration Module

**Branch**: `013-ai-gateway-integration` | **Date**: 2026-06-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/013-ai-gateway-integration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a dedicated NestJS `AiGatewayModule` that provides AI-powered features (chat, service classification, image analysis, cost estimation, provider recommendation, OCR document verification) by proxying requests to an external AI service (Python FastAPI). Includes JWT authentication, file upload validation, rate limiting, circuit breaker, retry with exponential backoff, request logging/auditing, and structured error handling. All endpoints are secured via existing JWT infrastructure.

## Technical Context

**Language/Version**: NestJS 10.3 / Node.js (TypeScript)

**Primary Dependencies**: TypeORM 0.3, class-validator, class-transformer, @nestjs/swagger 7.3, @nestjs/bull 10.1 (for async processing), multer (file uploads), @nestjs/throttler (rate limiting), axios (HTTP client for AI service calls)

**Storage**: PostgreSQL (UUID primary keys) via TypeORM entities; Prisma also present but new entities use TypeORM to match existing pattern (AnalyticsSnapshot, AdminActivityLog) — NEEDS CLARIFICATION: confirm TypeORM vs Prisma for AI Request Log entity

**Testing**: Jest (Unit & Integration)

**Target Platform**: Backend API (`/api/v1/ai/*`)

**Project Type**: Web-service (NestJS Modules) — both TypeORM and Prisma in use

**Performance Goals**: AI response returned within 30s (spec SC-001); file rejection within 2s (SC-005); support 100 concurrent requests (SC-002)

**Constraints**: REST conventions, UUIDs only, JWT auth, rate limiting (100 req/min/user), 30s timeout, max 3 retries with exponential backoff, circuit breaker after 5 failures, file uploads max 10MB per file / 5 files per request

**Scale/Scope**: Herfa Platform (Customer/Provider Marketplace)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] P1: Database schema defined — AiRequestLog and AiHealthMonitor entities defined in data-model.md
- [x] P2: Clean Architecture followed (Controller -> Service -> Repository) — existing standard
- [x] P3: Dedicated NestJS module planned (AiGatewayModule, not extending any existing module)
- [x] P4/P6: DTOs & Swagger decorators included (13 DTOs defined in spec + contracts)
- [x] P7/P8: JWT/Roles/Guards identified (reuse JwtAuthGuard; AiRateLimitGuard planned)
- [x] P9: PostgreSQL UUIDs & Timestamps included (both entities use UUID PK + timestamps)
- [x] P10/P11: Structured Errors with error codes defined; logging via NestJS Logger + AiRequestLog entity
- [x] P15: All 12 workflow steps accounted for (entities → migration → DTOs → module → services → controller → guards → Swagger → tests → wiring)

**All gates pass.**

## Project Structure

### Documentation (this feature)

```text
specs/013-ai-gateway-integration/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — codebase research and decisions
├── data-model.md        # Phase 1 output — entities, relationships, constraints
├── quickstart.md        # Phase 1 output — step-by-step implementation order
├── contracts/           # Phase 1 output — API contracts
│   └── README.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── entities/
│   ├── ai-request-log.entity.ts          # NEW — audit log of all AI requests
│   └── ai-health-monitor.entity.ts       # NEW — circuit breaker state tracking
│
├── modules/
│   └── ai-gateway/                       # NEW — dedicated NestJS module
│       ├── ai-gateway.module.ts
│       ├── ai-gateway.controller.ts      # Main AI proxy endpoints
│       ├── enums/
│       │   ├── ai-feature-type.enum.ts   # Chat, Classification, ImageAnalysis, etc.
│       │   └── ai-request-status.enum.ts # Success, Failed, Timeout, RateLimited
│       ├── dto/
│       │   ├── chat-request.dto.ts
│       │   ├── chat-response.dto.ts
│       │   ├── classify-service-request.dto.ts
│       │   ├── classify-service-response.dto.ts
│       │   ├── analyze-image-request.dto.ts
│       │   ├── analyze-image-response.dto.ts
│       │   ├── estimate-cost-request.dto.ts
│       │   ├── estimate-cost-response.dto.ts
│       │   ├── recommend-provider-request.dto.ts
│       │   ├── recommend-provider-response.dto.ts
│       │   ├── ocr-request.dto.ts
│       │   ├── ocr-response.dto.ts
│       │   └── error-response.dto.ts
│       ├── services/
│       │   ├── ai-gateway.service.ts     # Core orchestration + routing
│       │   ├── ai-client.service.ts      # HTTP client to external AI service
│       │   ├── circuit-breaker.service.ts # Circuit breaker state machine
│       │   ├── retry.service.ts           # Exponential backoff retry logic
│       │   ├── file-validator.service.ts  # File type/size validation
│       │   └── ai-request-log.service.ts # Audit log persistence
│       ├── guards/
│       │   └── ai-rate-limit.guard.ts    # Per-user rate limiting
│       ├── interceptors/
│       │   └── ai-logging.interceptor.ts # Request/response logging
│       └── filters/
│           └── ai-exception.filter.ts    # Standardized error responses
│
└── app.module.ts                        # MODIFIED — add AiGatewayModule
```

**Structure Decision**: Dedicated `ai-gateway` module under `src/modules/` following the established NestJS module pattern. New entities in `src/entities/` alongside existing entities. File upload handling reuses multer pattern from existing UploadsModule. Rate limiting leverages existing @nestjs/throttler.

## Complexity Tracking

> No violations — all Constitution gates pass pending Phase 1 output. No complexity justification needed.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
