# Research: AI Gateway & Integration Module

## 1. TypeORM vs Prisma for AI Request Log Entity

- **Decision**: Use TypeORM for the AI Request Log and AI Health Monitor entities
- **Rationale**: All existing audit/log entities (AnalyticsSnapshot, AdminActivityLog, AuditLog) use TypeORM decorators with `@Entity`. The project has TypeORM fully configured with auto-sync. New entities follow the same pattern for consistency.
- **Alternatives considered**: Prisma — would require schema changes and separate migration path; inconsistent with existing entity pattern.

## 2. External AI Service Integration

- **Decision**: HTTP client (axios) calling a configurable `AI_SERVICE_URL` (default `http://localhost:8000`) with JSON POST requests
- **Rationale**: The spec defines the AI service as a separate Python FastAPI service. Axios is the standard NestJS HTTP client with built-in timeout support and interceptors for logging/retry.
- **Alternatives considered**: @nestjs/axios (wrapper around axios, same approach); gRPC (overkill for initial implementation); direct TCP (not RESTful).

## 3. File Upload Handling for AI Images

- **Decision**: Reuse multer via `@nestjs/platform-express` `FileInterceptor` / `FilesInterceptor` with custom file filter (JPEG, PNG, WebP only) and 10MB size limit
- **Rationale**: Existing UploadsModule already uses multer with disk storage. For AI images, we'll use the same pattern but configure stricter validation.
- **Alternatives considered**: S3 direct upload (requires additional infra); base64 encoding in JSON (not suitable for large files).

## 4. Rate Limiting Strategy

- **Decision**: Use @nestjs/throttler with a custom `@Throttle()` decorator per endpoint, defaulting to 100 req/min per user
- **Rationale**: @nestjs/throttler already configured globally in AppModule. The spec requires user-scoped rate limiting (not IP-based). We'll attach user ID from JWT to the throttler tracker.
- **Alternatives considered**: express-rate-limit (already a dependency, but @nestjs/throttler is the NestJS-native way); custom middleware (duplicates existing infrastructure).

## 5. Circuit Breaker Implementation

- **Decision**: Custom in-memory circuit breaker service tracking consecutive failures per AI service endpoint, with configurable threshold (5 failures) and cooldown (30 seconds)
- **Rationale**: The spec requires a specific pattern (5 failures → open, 30s cooldown → half-open → retry). A dedicated service provides clear state machine semantics.
- **Alternatives considered**: @nestjs/bull queue-based breaker (too heavy for in-memory state); opossum library (adds dependency); Redis-based (cross-instance, but overkill for initial implementation).

## 6. Retry with Exponential Backoff

- **Decision**: Custom retry service using axios interceptors with configurable max retries (3), starting delay (100ms), and exponential backoff factor (2x)
- **Rationale**: The spec defines specific retry parameters (3 retries, starting 100ms). Axios interceptors can cleanly implement this without additional dependencies.
- **Alternatives considered**: rxjs retryWhen (too coupled to Observables); @nestjs/bull queue retries (too heavy for synchronous request proxying).

## 7. AI Request Audit Logging

- **Decision**: TypeORM entity `AiRequestLog` with fields: id, userId, featureType, requestPayload, responsePayload, status, processingTime, errorMessage, createdAt
- **Rationale**: The spec requires persistent audit logging with all request details. TypeORM provides the simplest path alongside existing infrastructure.
- **Alternatives considered**: Winston file logging (not queryable); Prisma (inconsistent with other audit entities); external logging service (dependent on infra not yet decided).

## 8. Environment Configuration

- **Decision**: New env vars via @nestjs/config (ConfigService):
  - `AI_SERVICE_URL` — external AI service URL (default: `http://localhost:8000`)
  - `AI_REQUEST_TIMEOUT` — request timeout in ms (default: `30000`)
  - `AI_RETRY_MAX` — max retries (default: `3`)
  - `AI_RETRY_BASE_DELAY` — initial retry delay in ms (default: `100`)
  - `AI_CIRCUIT_BREAKER_THRESHOLD` — consecutive failures before trip (default: `5`)
  - `AI_CIRCUIT_BREAKER_COOLDOWN` — cooldown in ms (default: `30000`)
  - `AI_RATE_LIMIT_TTL` — rate limit window in ms (default: `60000`)
  - `AI_RATE_LIMIT_MAX` — max requests per window (default: `100`)
- **Rationale**: All existing config follows the @nestjs/config pattern with `.env` file.
- **Alternatives considered**: Hardcoded values (not configurable); dedicated config service (unnecessary abstraction).

## 9. AI Service API Contract

- **Decision**: The external AI service (Python FastAPI) will expose endpoints matching our feature types:
  - `POST /ai/chat` — Chat completion
  - `POST /ai/classify` — Service classification
  - `POST /ai/analyze-image` — Image analysis (multipart)
  - `POST /ai/estimate-cost` — Cost estimation
  - `POST /ai/recommend-providers` — Provider recommendation
  - `POST /ai/ocr` — OCR document verification
- **Rationale**: Clear separation of concerns — NestJS handles auth, validation, rate limiting, logging; Python service handles AI/ML logic.
- **Alternatives considered**: Single generic endpoint (less type-safe); gRPC (more complex contract).

## 10. Project Structure

- **Decision**: New `src/modules/ai-gateway/` module with nested `dto/`, `services/`, `enums/`, `guards/`, `interceptors/`, `filters/` directories
- **Rationale**: Follows the established NestJS module pattern used by analytics, support, tracking, and other modules.
- **Alternatives considered**: Top-level `src/ai-gateway/` (inconsistent with module structure); merging into existing module (violates P3 — dedicated module).
