# Quickstart: AI Gateway & Integration Module

## Implementation Order (12 Steps)

### Step 1: Database Entities
- [ ] Create `src/entities/ai-request-log.entity.ts` — TypeORM entity with UUID PK, userId (FK), featureType enum, requestPayload JSONB, responsePayload JSONB, status enum, processingTime, errorMessage, timestamps
- [ ] Create `src/entities/ai-health-monitor.entity.ts` — TypeORM entity with UUID PK, serviceName (unique), state enum, consecutiveFailures, lastFailureAt, lastSuccessAt, cooldownUntil, totalRequests/Failures/Successes, timestamps

### Step 2: Generate Migration
- [ ] Run `npm run migration:generate -- src/migrations/CreateAiRequestLogAndHealthMonitor`
- [ ] Verify migration SQL creates tables with indexes

### Step 3: Create DTOs
- [ ] Create `src/modules/ai-gateway/dto/chat-request.dto.ts` — message (string, 1-2000 chars)
- [ ] Create `src/modules/ai-gateway/dto/chat-response.dto.ts` — reply, conversationId
- [ ] Create `src/modules/ai-gateway/dto/classify-service-request.dto.ts` — description (10-1000 chars)
- [ ] Create `src/modules/ai-gateway/dto/classify-service-response.dto.ts` — category, suggestedService, confidenceScore
- [ ] Create `src/modules/ai-gateway/dto/analyze-image-request.dto.ts` — image (file)
- [ ] Create `src/modules/ai-gateway/dto/analyze-image-response.dto.ts` — problemType, serviceCategory, confidenceScore, recommendations[]
- [ ] Create `src/modules/ai-gateway/dto/estimate-cost-request.dto.ts` — description, category, images (optional, max 5)
- [ ] Create `src/modules/ai-gateway/dto/estimate-cost-response.dto.ts` — estimatedCostRange {min, max}, estimatedDuration, confidenceScore
- [ ] Create `src/modules/ai-gateway/dto/recommend-provider-request.dto.ts` — description, location (optional), category (optional)
- [ ] Create `src/modules/ai-gateway/dto/recommend-provider-response.dto.ts` — providers[] with providerId, matchScore, explanation
- [ ] Create `src/modules/ai-gateway/dto/ocr-request.dto.ts` — documentImage (file), documentType (enum)
- [ ] Create `src/modules/ai-gateway/dto/ocr-response.dto.ts` — extractedData, validationStatus, confidenceScore
- [ ] Create `src/modules/ai-gateway/dto/error-response.dto.ts` — success (false), errorCode, message
- [ ] Add `@ApiProperty()` Swagger decorators, class-validator rules, and examples to all DTOs

### Step 4: Create Enums
- [ ] Create `src/modules/ai-gateway/enums/ai-feature-type.enum.ts` — Chat, Classification, ImageAnalysis, CostEstimation, ProviderRecommendation, Ocr
- [ ] Create `src/modules/ai-gateway/enums/ai-request-status.enum.ts` — Pending, Success, Failed, Timeout, RateLimited, CircuitOpen
- [ ] Create `src/modules/ai-gateway/enums/circuit-breaker-state.enum.ts` — Closed, Open, HalfOpen
- [ ] Create `src/modules/ai-gateway/enums/ocr-document-type.enum.ts` — NationalId, Passport, ProfessionalLicense
- [ ] Create `src/modules/ai-gateway/enums/ocr-validation-status.enum.ts` — Verified, SuspectedFraud, Unclear

### Step 5: Create AiGatewayModule
- [ ] Create `src/modules/ai-gateway/ai-gateway.module.ts` with all services, controller, guards, interceptors, filters
- [ ] Import TypeOrmModule.forFeature([AiRequestLog, AiHealthMonitor])
- [ ] Import HttpModule (for axios HTTP calls)
- [ ] Import ThrottlerModule (for rate limiting)
- [ ] Export AiGatewayService for potential cross-module use
- [ ] Register module in `src/app.module.ts`

### Step 6: Create Services
- [ ] Create `ai-client.service.ts` — HTTP client wrapping axios calls to external AI service with configurable URL and timeout
- [ ] Create `file-validator.service.ts` — validates file type (JPEG/PNG/WebP), size (max 10MB), count (max 5)
- [ ] Create `circuit-breaker.service.ts` — state machine (closed → open → half_open → closed) with configurable threshold/cooldown
- [ ] Create `retry.service.ts` — exponential backoff (base 100ms, factor 2x, max 3 retries) wrapping AI client calls
- [ ] Create `ai-request-log.service.ts` — CRUD for AiRequestLog entity with query methods for audit/reporting
- [ ] Create `ai-gateway.service.ts` — orchestrator: validates → checks circuit breaker → logs request → calls AI (with retry) → logs response → returns DTO

### Step 7: Create Controller
- [ ] Create `ai-gateway.controller.ts` with 6 endpoints:
  - `POST /api/v1/ai/chat` — chat endpoint
  - `POST /api/v1/ai/classify` — service classification
  - `POST /api/v1/ai/analyze-image` — image analysis (multipart)
  - `POST /api/v1/ai/estimate-cost` — cost estimation
  - `POST /api/v1/ai/recommend-providers` — provider recommendation
  - `POST /api/v1/ai/ocr` — OCR document verification
- [ ] All endpoints guarded with `@UseGuards(JwtAuthGuard)`
- [ ] Swagger decorators: @ApiTags('AI Gateway'), @ApiOperation, @ApiResponse, @ApiBearerAuth, @ApiConsumes (for multipart)

### Step 8: Create Guards
- [ ] Create `ai-rate-limit.guard.ts` — Extends @nestjs/throttler to track per-user (not per-IP) rate limits using JWT user ID

### Step 9: Create Swagger Documentation
- [ ] Add comprehensive Swagger examples to all DTOs
- [ ] Add `@ApiBody({ type: CreateChatDto, examples: {...} })` where applicable
- [ ] Add `@ApiResponse({ status: 503, description: 'AI service unavailable', type: ErrorResponseDto })` to all endpoints

### Step 10: Create Unit Tests
- [ ] Test `ai-client.service.ts` — mock axios, test success/failure/timeout
- [ ] Test `circuit-breaker.service.ts` — test state transitions (closed→open after 5 failures, open→half_open after 30s, half_open→closed on success)
- [ ] Test `retry.service.ts` — test retry count, exponential backoff timing
- [ ] Test `file-validator.service.ts` — test valid/invalid file types, size limits
- [ ] Test `ai-gateway.service.ts` — test full flow with mocked dependencies
- [ ] Test `ai-gateway.controller.ts` — test each endpoint with valid/invalid requests

### Step 11: Verify API Contracts
- [ ] Run NestJS app and test all 6 endpoints via Swagger UI or Postman
- [ ] Verify error responses match `ErrorResponse` contract
- [ ] Verify rate limiting blocks after 100 requests
- [ ] Verify file validation rejects invalid types/sizes
- [ ] Verify circuit breaker blocks after simulated failures

### Step 12: Generate Integration Notes
- [ ] Document `AI_SERVICE_URL` env var requirement for deployment
- [ ] Document expected AI service API contract (send contracts/README.md to AI service team)
- [ ] Document rate limit configuration for production tuning
- [ ] Document circuit breaker reset procedure
- [ ] Add `.env.example` entries for all AI_* configuration variables
