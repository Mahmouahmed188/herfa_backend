# AI Gateway Integration Audit

> **Date:** 2026-06-10  
> **Scope:** Full-stack integration between NestJS backend and external FastAPI AI Service  
> **Methodology:** Source code inspection, configuration review, dependency analysis, endpoint mapping

---

## 1. AI Service URL Configuration

### Status: ⚠️ PARTIALLY CONFIGURED

| Check | Result | Details |
|-------|--------|---------|
| `AI_SERVICE_URL` defined in `.env` | ❌ **FAIL** | `.env` contains no AI-related variables |
| `AI_SERVICE_URL` defined in `.env.example` | ✅ PASS | Line 51: `AI_SERVICE_URL=http://localhost:8000` |
| Hardcoded fallback exists | ⚠️ YES | `src/modules/ai-gateway/services/ai-client.service.ts:13` — defaults to `http://localhost:8000` |
| All AI env vars documented | ✅ PASS | `.env.example` lines 51-58 document all 7 `AI_*` variables |
| `NODE_ENV`-based URL switching | ❌ **FAIL** | No environment-aware URL resolution exists |

### Files Referencing `AI_SERVICE_URL`

| File | Line | Usage |
|------|------|-------|
| `src/modules/ai-gateway/services/ai-client.service.ts` | 13 | `ConfigService.get<string>('AI_SERVICE_URL')` — sets axios `baseURL` |
| `.env.example` | 51 | Documentation default |

### Analysis

The only runtime reference to `AI_SERVICE_URL` is in `ai-client.service.ts:12-13`:

```typescript
const aiServiceUrl =
  this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
```

**The actual `.env` file is missing all 7 `AI_*` variables.** This means every AI request URL defaults to `http://localhost:8000`, which is **not production-safe**. The `AI_SERVICE_URL` is properly externalized (read from env), but the configuration is absent from the deployed environment file.

**No production vs. development distinction** — the same URL resolution logic applies regardless of `NODE_ENV`.

---

## 2. HTTP Communication Layer

### Status: ⚠️ USES RAW AXIOS (NO HttpModule)

| Check | Result | Details |
|-------|--------|---------|
| `HttpModule` imported (`@nestjs/axios`) | ❌ **FAIL** | Not imported in `AiGatewayModule` or `AppModule` |
| `HttpService` injected | ❌ **FAIL** | Not used anywhere |
| Raw `axios` used | ✅ YES | `src/modules/ai-gateway/services/ai-client.service.ts:3` imports `axios` directly |
| Custom HTTP client | ✅ YES | `AiClientService` wraps raw axios |
| `fetch()` used | ❌ No | Not present |

### File: `src/modules/ai-gateway/services/ai-client.service.ts`

```typescript
import axios, { AxiosInstance } from 'axios';
```

### Analysis

The backend uses raw `axios` instead of `@nestjs/axios` `HttpModule`. This is **not a critical failure** — it works. However, it means:

1. No NestJS dependency injection wrapper for the HTTP client
2. No built-in `HttpService` interceptors integration
3. The `AiClientService` manually manages the `AxiosInstance` lifecycle
4. Testing requires mocking `axios` directly rather than using NestJS's testing utilities for `HttpService`

The module (`AiGatewayModule`) does **not import `HttpModule`** and **does not need to** since raw `axios` is used directly. This is a design choice, not a bug, but it deviates from NestJS conventions.

---

## 3. AI Client Implementation

### Status: ✅ FUNCTIONAL

**File:** `src/modules/ai-gateway/services/ai-client.service.ts`

### Endpoint Construction

```typescript
const endpoint = `/ai/${featureType}`;
```

This calls: `POST {AI_SERVICE_URL}/ai/{featureType}`

### Feature Type to URL Mapping

| Feature Type Enum | Full URL Path |
|-------------------|---------------|
| `chat` | `POST {AI_SERVICE_URL}/ai/chat` |
| `classification` | `POST {AI_SERVICE_URL}/ai/classification` |
| `image_analysis` | `POST {AI_SERVICE_URL}/ai/image_analysis` |
| `cost_estimation` | `POST {AI_SERVICE_URL}/ai/cost_estimation` |
| `provider_recommendation` | `POST {AI_SERVICE_URL}/ai/provider_recommendation` |
| `ocr` | `POST {AI_SERVICE_URL}/ai/ocr` |

### Request Format

- **Content-Type:** `application/json`
- **Body:** The `payload` object is sent as-is via `axios.post()`
- **Files:** File paths (not binary data) are sent in the JSON payload

### Response Format

- Expects JSON response from the AI service
- Returns `response.data` directly (no transformation)

### Analysis

The client sends requests correctly. However, there is a critical design issue with file uploads:

**Files are NOT forwarded to the AI service.** The controller saves files to `./uploads` via multer `diskStorage`, then sends only the **local filesystem path** (e.g., `./uploads/abc123.jpg`) in the JSON payload. For this to work:

- The AI service must have access to the same filesystem
- OR file content must be read and sent as base64/multipart

In a distributed deployment (e.g., Railway), the backend and AI service are separate containers — the AI service **will not have access** to the backend's local `./uploads/` directory.

### Retry Configuration

| Parameter | Default | Configurable? |
|-----------|---------|---------------|
| Max retries | 3 | `AI_RETRY_MAX` |
| Base delay | 100ms | `AI_RETRY_BASE_DELAY` |
| Backoff | Exponential (2^attempt) | Fixed algorithm |
| Retryable errors | 5xx, 429, ECONNREFUSED, ECONNRESET | Hardcoded in `isRetryable()` |

---

## 4. Module Configuration Audit

### Status: ⚠️ MISSING IMPORTS / REGISTRATIONS

**File:** `src/modules/ai-gateway/ai-gateway.module.ts`

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([AiRequestLog, AiHealthMonitor])],
  controllers: [AiGatewayController],
  providers: [
    AiGatewayService,
    AiClientService,
    CircuitBreakerService,
    RetryService,
    FileValidatorService,
    AiRequestLogService,
    AiRateLimitGuard,
  ],
  exports: [AiGatewayService],
})
```

### Dependency Validation

| Provider | Registered? | Dependencies | Valid? |
|----------|-------------|--------------|--------|
| `AiGatewayService` | ✅ | `CircuitBreakerService`, `RetryService`, `AiRequestLogService`, `FileValidatorService`, `ConfigService` | ✅ |
| `AiClientService` | ✅ | `ConfigService` | ✅ |
| `CircuitBreakerService` | ✅ | `Repository<AiHealthMonitor>`, `ConfigService` | ✅ |
| `RetryService` | ✅ | `AiClientService`, `ConfigService` | ✅ |
| `FileValidatorService` | ✅ | None | ✅ |
| `AiRequestLogService` | ✅ | `Repository<AiRequestLog>` | ✅ |
| `AiRateLimitGuard` | ✅ | `Reflector` (inherited from `ThrottlerGuard`) | ✅ |
| `AiLoggingInterceptor` | ❌ **Not registered** | None needed (used via `@UseInterceptors`) | ⚠️ OK — not required to be a provider |
| `AiExceptionFilter` | ❌ **Not registered** | None | ⚠️ Dead code — see below |

### Issues Found

1. **`AiExceptionFilter` is never registered** — `src/modules/ai-gateway/filters/ai-exception.filter.ts` defines a filter that catches `HttpException` and returns standardized error responses, but it is never bound via `@UseFilters()` in the controller or `APP_FILTER` in the module. The global `AllExceptionsFilter` handles errors instead. This is **dead code**.

2. **No `HttpModule` import** — Not required since raw `axios` is used, but worth noting as a convention deviation.

3. **`ThrottlerModule` not imported locally** — Relies on the globally configured `ThrottlerModule` from `AppModule`. This works but makes the guard dependent on global configuration.

---

## 5. Controller Audit

### Status: ✅ WELL-STRUCTURED

**File:** `src/modules/ai-gateway/ai-gateway.controller.ts`  
**Route Prefix:** `api/v1/ai`  
**Global Guards:** `JwtAuthGuard`, `AiRateLimitGuard`  
**Global Interceptors:** `AiLoggingInterceptor`

| Endpoint | HTTP Method | DTO (Request) | DTO (Response) | Auth Required | Service Called |
|----------|-------------|---------------|----------------|---------------|----------------|
| `/chat` | POST | `ChatRequestDto` | `ChatResponseDto` | JWT | `AiGatewayService.processRequest(AiFeatureType.CHAT, ...)` |
| `/classify` | POST | `ClassifyServiceRequestDto` | `ClassifyServiceResponseDto` | JWT | `AiGatewayService.processRequest(AiFeatureType.CLASSIFICATION, ...)` |
| `/analyze-image` | POST | Multipart `image` file | `AnalyzeImageResponseDto` | JWT | `AiGatewayService.processRequest(AiFeatureType.IMAGE_ANALYSIS, ...)` |
| `/estimate-cost` | POST | `EstimateCostRequestDto` + up to 5 images | `EstimateCostResponseDto` | JWT | `AiGatewayService.processRequest(AiFeatureType.COST_ESTIMATION, ...)` |
| `/recommend-providers` | POST | `RecommendProviderRequestDto` | `RecommendProviderResponseDto` | JWT | `AiGatewayService.processRequest(AiFeatureType.PROVIDER_RECOMMENDATION, ...)` |
| `/ocr` | POST | `OcrRequestDto` + `documentImage` file | `OcrResponseDto` | JWT | `AiGatewayService.processRequest(AiFeatureType.OCR, ...)` |

### Notes

- All endpoints require JWT authentication via `JwtAuthGuard`
- All endpoints are rate-limited via `AiRateLimitGuard` (extends `ThrottlerGuard`, tracks by user ID)
- File upload endpoints use `multer` `diskStorage` saving to `./uploads` with random 32-char hex filenames
- File validation happens in the controller before delegation to service
- `ChatRequestDto` has no `conversationId` field despite `ChatResponseDto` returning `conversationId: string | null`

---

## 6. Railway Readiness Check

### Status: ❌ NOT READY

| Check | Result | Details |
|-------|--------|---------|
| Environment variables externalized | ⚠️ Partial | Code reads from env, but `.env` is missing all `AI_*` vars |
| `AI_SERVICE_URL` configurable | ✅ Yes | Via `ConfigService.get('AI_SERVICE_URL')` |
| No localhost dependencies | ❌ **FAIL** | Default fallback: `http://localhost:8000` |
| No `localhost` hardcoded in critical paths | ❌ **FAIL** | `ai-client.service.ts:13` hardcodes `localhost:8000` as default |
| Production-safe defaults | ❌ **FAIL** | Missing all 7 `AI_*` env vars from actual `.env` |
| File upload path persistence | ❌ **FAIL** | `./uploads` is ephemeral on Railway — files lost on restart |
| Dockerfile exists (backend) | ❌ **FAIL** | No Dockerfile in backend project root |
| `railway.json` exists | ❌ **FAIL** | Not present |
| `docker-compose.yml` exists (backend) | ❌ **FAIL** | Not present |
| Redis configured for production | ⚠️ Partial | `REDIS_HOST` fallback is `localhost` |

### Analysis

The backend **cannot be deployed to Railway in its current state** without:

1. All `AI_*` environment variables must be configured in Railway dashboard
2. `AI_SERVICE_URL` must point to the deployed AI service URL (not `localhost:8000`)
3. `./uploads` directory is ephemeral — file uploads will be lost on restart
4. No backend Dockerfile exists for containerized deployment
5. Redis defaults to `localhost`

**The FastAPI AI Service is deployable** (has Dockerfile), but the **backend is not**.

---

## 7. Missing Integration Detection

### Critical Issues (Will Block Communication)

| # | Problem | File | Severity |
|---|---------|------|----------|
| 1 | **`AI_SERVICE_URL` not set in `.env`** — all URLs default to `localhost:8000` | `.env` | 🔴 CRITICAL |
| 2 | **Files not sent to AI service** — only local paths are sent; AI service cannot access backend filesystem in distributed deployment | `ai-gateway.controller.ts:171,232,317` | 🔴 CRITICAL |
| 3 | **No service-to-service authentication** — no API key, JWT, or shared secret between backend and AI service | `ai-client.service.ts` | 🔴 CRITICAL |
| 4 | **No backend Dockerfile** — cannot containerize for Railway deployment | Project root | 🔴 CRITICAL |

### Moderate Issues

| # | Problem | File | Severity |
|---|---------|------|----------|
| 5 | **`AiExceptionFilter` is dead code** — defined but never registered | `ai-gateway/filters/ai-exception.filter.ts` | 🟡 MODERATE |
| 6 | **No health check endpoint** for AI service connectivity | — | 🟡 MODERATE |
| 7 | **`serviceName` hardcoded** as `'ai-service'` in circuit breaker | `ai-gateway.service.ts:19` | 🟡 MODERATE |
| 8 | **Missing request validation** — `EstimateCostRequestDto.category` has no `@IsIn()` or enum validation | `dto/estimate-cost-request.dto.ts` | 🟡 MODERATE |
| 9 | **ChatRequestDto lacks conversationId** but ChatResponseDto returns it | `dto/chat-request.dto.ts` | 🟡 MODERATE |
| 10 | **Raw axios instead of HttpModule** — deviates from NestJS conventions | `ai-client.service.ts` | 🟡 MODERATE |

### Minor Issues

| # | Problem | File | Severity |
|---|---------|------|----------|
| 11 | **`AiHealthMonitor.entity.ts` uses `type: 'datetime'`** — should be `timestamp` for PostgreSQL | `entities/ai-health-monitor.entity.ts` | 🟢 MINOR |
| 12 | **No unit tests** — all AI-related test tasks marked incomplete | `specs/tasks.md` | 🟢 MINOR |
| 13 | **Upload filenames collide on same ms** — random 32-char hex could collide | `ai-gateway.controller.ts:119` | 🟢 MINOR |

---

## 8. FastAPI Compatibility Check

### Status: ⚠️ MISMATCH — Endpoint URLs Differ

The backend constructs AI service URLs as:

```
POST {AI_SERVICE_URL}/ai/{featureType}
```

The expected FastAPI endpoints (from the spec) are:

| FastAPI Endpoint | Backend Constructed URL | Match? | Notes |
|------------------|------------------------|--------|-------|
| `POST /api/v1/chat` | `POST {URL}/ai/chat` | ❌ **NO** — path differs (`/ai/chat` vs `/api/v1/chat`) |
| `POST /api/v1/problem-analysis/text` | `POST {URL}/ai/classification` | ❌ **NO** — path and concept differ |
| `POST /api/v1/problem-analysis/image` | `POST {URL}/ai/image_analysis` | ❌ **NO** — path differs |
| `POST /api/v1/problem-analysis/combined` | ❌ **Not implemented** | ❌ **MISSING** |
| `POST /api/v1/provider-verification` | ❌ **Not implemented** | ❌ **MISSING** — related to `PROVIDER_RECOMMENDATION` |
| `POST /api/v1/ocr` | `POST {URL}/ai/ocr` | ❌ **NO** — path differs |

### DTO Mapping Assessment

| Expected FastAPI Input | Backend DTO | Match? |
|------------------------|-------------|--------|
| `POST /api/v1/chat` — `{ message, conversation_id? }` | `ChatRequestDto` — `{ message }` | ⚠️ Missing `conversationId` field |
| `POST /api/v1/problem-analysis/text` — `{ description }` | `ClassifyServiceRequestDto` — `{ description }` | ✅ Field matches |
| `POST /api/v1/ocr` — `{ image, document_type }` | `OcrRequestDto` — `{ documentType }` + file | ⚠️ Sends path, not binary |

### Critical Finding

**The backend's AI client constructs URLs with a completely different path structure than what the FastAPI service exposes.** The backend sends to:

```
POST {URL}/ai/chat
POST {URL}/ai/classification
POST {URL}/ai/image_analysis
POST {URL}/ai/cost_estimation
POST {URL}/ai/provider_recommendation
POST {URL}/ai/ocr
```

But the FastAPI service (per spec) exposes:

```
POST /api/v1/chat
POST /api/v1/problem-analysis/text
POST /api/v1/problem-analysis/image
POST /api/v1/problem-analysis/combined
POST /api/v1/provider-verification
POST /api/v1/ocr
```

**These will never connect without significant changes on one side.**

---

## 9. Integration Status Summary

### Scorecard

| Component | Status | Details |
|-----------|--------|---------|
| **AI Module Structure** | ✅ PASS | Well-organized module with controller, services, DTOs, enums, guards, interceptors |
| **HTTP Communication Layer** | ⚠️ PASS (with caveats) | Raw axios works but no `HttpModule`; missing service-to-service auth |
| **AI Client Service** | ✅ PASS | `AiClientService` correctly constructs requests with retry logic |
| **Retry & Circuit Breaker** | ✅ PASS | Exponential backoff, configurable retries, persistent circuit breaker |
| **Environment Configuration** | ❌ **FAIL** | `.env` missing all 7 `AI_*` variables; falls back to `localhost:8000` |
| **FastAPI Endpoint Compatibility** | ❌ **FAIL** | URL path structure completely mismatched (`/ai/{type}` vs `/api/v1/{endpoint}`) |
| **File Upload Handling** | ❌ **FAIL** | Sends local paths instead of file data; not compatible with distributed deployment |
| **Service-to-Service Auth** | ❌ **FAIL** | No authentication between backend and AI service |
| **Railway Readiness** | ❌ **FAIL** | No Dockerfile, no railway.json, ephemeral uploads, localhost defaults |
| **Dead Code Elimination** | ⚠️ Partial | `AiExceptionFilter` defined but never registered |
| **Input Validation** | ⚠️ Partial | `EstimateCostRequestDto.category` lacks enum validation |
| **Testing** | ❌ **FAIL** | No unit tests for AI Gateway |

### Overall Readiness: **30%**

The backend has a **well-designed AI Gateway module structure** with proper separation of concerns, circuit breaker pattern, retry logic, and request logging. However, **critical integration gaps** prevent it from actually communicating with the FastAPI AI Service in production.

---

## 10. Required Changes Before Production

### 🔴 CRITICAL (Must Fix)

#### 1. Missing AI Environment Variables

- **Problem:** `.env` does not contain any `AI_*` variables; all config falls back to defaults (`localhost:8000`)
- **Files:** `.env`
- **Fix:** Add all 7 AI variables to `.env`
- **Example:**
  ```dotenv
  AI_SERVICE_URL=http://ai-service:8000
  AI_REQUEST_TIMEOUT=30000
  AI_RETRY_MAX=3
  AI_RETRY_BASE_DELAY=100
  AI_CIRCUIT_BREAKER_THRESHOLD=5
  AI_CIRCUIT_BREAKER_COOLDOWN=30000
  AI_RATE_LIMIT_TTL=60000
  AI_RATE_LIMIT_MAX=100
  ```

#### 2. FastAPI Endpoint Path Mismatch

- **Problem:** Backend sends to `POST /ai/{featureType}` but FastAPI expects `POST /api/v1/{endpoint}` (different endpoints entirely)
- **Files:** `src/modules/ai-gateway/services/ai-client.service.ts:27`
- **Fix:** Align the URL construction with the FastAPI service's actual route structure. Either:
  - Change `AiClientService` to map each `AiFeatureType` to the correct FastAPI endpoint path
  - Or change the FastAPI service to accept `/ai/{featureType}` routes
- **Example (backend fix):**
  ```typescript
  private readonly endpointMap: Record<AiFeatureType, string> = {
    [AiFeatureType.CHAT]: '/api/v1/chat',
    [AiFeatureType.CLASSIFICATION]: '/api/v1/problem-analysis/text',
    [AiFeatureType.IMAGE_ANALYSIS]: '/api/v1/problem-analysis/image',
    [AiFeatureType.COST_ESTIMATION]: '/api/v1/problem-analysis/combined',
    [AiFeatureType.PROVIDER_RECOMMENDATION]: '/api/v1/provider-verification',
    [AiFeatureType.OCR]: '/api/v1/ocr',
  };
  ```

#### 3. File Upload — Send Binary Data, Not Local Paths

- **Problem:** Controller saves files locally and sends only the path. In distributed deployment, the AI service cannot access the backend's filesystem.
- **Files:** `src/modules/ai-gateway/ai-gateway.controller.ts` (all file upload endpoints)
- **Fix:** Read file contents and send as base64 or multipart/form-data
- **Example (base64 approach in controller):**
  ```typescript
  const fs = require('fs').promises;
  const imageBuffer = await fs.readFile(image.path);
  const base64Image = imageBuffer.toString('base64');
  // ... send base64Image instead of image.path
  ```
  Or use `Buffer` from `sharp`/`fs` and send multipart via `form-data` npm package in `AiClientService`.

#### 4. Add Service-to-Service Authentication

- **Problem:** No authentication between backend and AI service — anyone who knows the URL can call it
- **Files:** `src/modules/ai-gateway/services/ai-client.service.ts`
- **Fix:** Add an `AI_SERVICE_API_KEY` header to all outgoing requests
- **Example:**
  ```typescript
  const apiKey = this.configService.get<string>('AI_SERVICE_API_KEY');
  this.client = axios.create({
    baseURL: aiServiceUrl,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'X-API-Key': apiKey } : {}),
    },
  });
  ```
  Add `AI_SERVICE_API_KEY` to `.env.example` and `.env`.

#### 5. Create Backend Dockerfile

- **Problem:** No Dockerfile means the backend cannot be containerized for Railway deployment
- **Files:** Project root
- **Fix:** Create a production Dockerfile for the NestJS backend
- **Example:**
  ```dockerfile
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build

  FROM node:20-alpine AS runner
  WORKDIR /app
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/node_modules ./node_modules
  COPY --from=builder /app/package.json ./
  EXPOSE 3001
  CMD ["node", "dist/main"]
  ```

### 🟡 MODERATE (Should Fix)

#### 6. Set Production AI_SERVICE_URL Fallback

- **Problem:** Default fallback to `localhost:8000` will fail in production
- **Files:** `src/modules/ai-gateway/services/ai-client.service.ts:12-13`
- **Fix:** Use a production-aware default or throw if not configured
- **Example:**
  ```typescript
  const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL');
  if (!aiServiceUrl) {
    throw new Error('AI_SERVICE_URL environment variable is required');
  }
  ```

#### 7. Externalize `serviceName`

- **Problem:** `serviceName = 'ai-service'` is hardcoded in `AiGatewayService`
- **Files:** `src/modules/ai-gateway/services/ai-gateway.service.ts:19`
- **Fix:** Make it configurable via `ConfigService`
- **Example:**
  ```typescript
  private readonly serviceName: string;
  // in constructor:
  this.serviceName = this.configService.get<string>('AI_SERVICE_NAME') || 'ai-service';
  ```

#### 8. Register `AiExceptionFilter` or Remove It

- **Problem:** Filter is dead code
- **Files:** `src/modules/ai-gateway/filters/ai-exception.filter.ts`
- **Fix:** Either register via `APP_FILTER` provider or in controller via `@UseFilters()`, or delete the file

#### 9. Add `conversationId` to `ChatRequestDto`

- **Problem:** Response DTO returns `conversationId` but request DTO doesn't accept it
- **Files:** `dto/chat-request.dto.ts`
- **Fix:** Add optional `conversationId` field

#### 10. Add `@IsIn()` Validation to `EstimateCostRequestDto.category`

- **Problem:** No enum validation on category field
- **Files:** `dto/estimate-cost-request.dto.ts`
- **Fix:** Add `@IsIn()` with valid service categories

### 🟢 MINOR (Nice to Have)

#### 11. Fix `AiHealthMonitor` Column Type

- **Files:** `src/entities/ai-health-monitor.entity.ts`
- **Fix:** Change `@Column({ type: 'datetime' })` to `@Column({ type: 'timestamp' })` for PostgreSQL compatibility

#### 12. Add Health Check Endpoint

- **Files:** New file or controller
- **Fix:** Add `POST /api/v1/ai/health` or leverage existing health check to verify AI service connectivity

#### 13. Add Unit Tests

- **Files:** New `*.spec.ts` files
- **Fix:** Write tests for `AiClientService`, `AiGatewayService`, `RetryService`, `CircuitBreakerService`

---

## Appendix: File Reference Map

| File | Purpose |
|------|---------|
| `src/modules/ai-gateway/ai-gateway.module.ts` | Module registration |
| `src/modules/ai-gateway/ai-gateway.controller.ts` | 6 REST endpoints |
| `src/modules/ai-gateway/services/ai-gateway.service.ts` | Orchestrator (circuit breaker, logging, timeout) |
| `src/modules/ai-gateway/services/ai-client.service.ts` | HTTP client to FastAPI |
| `src/modules/ai-gateway/services/retry.service.ts` | Exponential backoff retry |
| `src/modules/ai-gateway/services/circuit-breaker.service.ts` | Circuit breaker state machine |
| `src/modules/ai-gateway/services/file-validator.service.ts` | File upload validation |
| `src/modules/ai-gateway/services/ai-request-log.service.ts` | Request/response logging |
| `src/modules/ai-gateway/guards/ai-rate-limit.guard.ts` | Rate limiting |
| `src/modules/ai-gateway/interceptors/ai-logging.interceptor.ts` | Request logging |
| `src/modules/ai-gateway/filters/ai-exception.filter.ts` | Error response formatting (dead code) |
| `src/modules/ai-gateway/dto/*.ts` | 12 DTO files |
| `src/modules/ai-gateway/enums/*.ts` | 5 enum files |
| `src/entities/ai-request-log.entity.ts` | Request log entity |
| `src/entities/ai-health-monitor.entity.ts` | Circuit breaker health entity |
| `src/app.module.ts` | Root module (imports AiGatewayModule) |
| `.env` | Actual env (missing AI vars) |
| `.env.example` | Example env (documents AI vars) |
