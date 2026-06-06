# Feature Specification: AI Gateway & Integration Module

**Feature Branch**: `013-ai-gateway-integration`

**Created**: 2026-06-06

**Status**: Draft

**Input**: User description: "AI Gateway & Integration Module for the Herfa Backend"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - AI Chat Assistance (Priority: P1)

A user needs help with using the Herfa platform. They ask a question through the AI chat feature, and the system forwards their question to the AI service, returning a helpful response.

**Why this priority**: Chat assistance is the most frequently used AI feature and provides immediate value to users by answering their questions without requiring human support.

**Independent Test**: Can be fully tested by submitting a chat question and verifying a response is returned within an acceptable time.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they submit a chat message with a natural language question, **Then** the system returns an AI-generated response within 30 seconds.
2. **Given** the AI service is unavailable, **When** the user submits a chat message, **Then** the system returns a standardized error message indicating the service is temporarily unavailable.
3. **Given** the user is not authenticated, **When** they attempt to use the AI chat, **Then** the system rejects the request with an authentication error.

---

### User Story 2 - Service Classification (Priority: P1)

A user describes a home maintenance problem in natural language, and the system classifies it into the appropriate service category with a confidence score.

**Why this priority**: Service classification powers the core booking flow by helping users identify the right service category for their problem.

**Independent Test**: Can be fully tested by submitting a problem description and verifying the response contains a category, suggested service, and confidence score.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they describe a maintenance problem (e.g., "The bathroom sink is leaking"), **Then** the system returns a category, suggested service, and confidence score.
2. **Given** the submitted description is empty, **When** the user attempts classification, **Then** the system rejects the request with a validation error.
3. **Given** the description is in an unsupported language, **When** the user submits it, **Then** the system returns the best-effort classification or an appropriate message.

---

### User Story 3 - Image Problem Detection (Priority: P1)

A user uploads an image of a home maintenance issue, and the system analyzes the image to identify the problem type and recommend services.

**Why this priority**: Visual problem detection helps users who cannot describe their issue in words and improves diagnostic accuracy.

**Independent Test**: Can be fully tested by uploading an image of a known problem and verifying the analysis results.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they upload an image of a visible problem (e.g., water leak), **Then** the system returns a problem type, service category, confidence score, and recommendations.
2. **Given** the user uploads a file that exceeds the maximum size limit, **When** they submit the image, **Then** the system rejects the upload with a file size error.
3. **Given** the user uploads an unsupported file format, **When** they submit the image, **Then** the system rejects the upload with a format error.
4. **Given** the uploaded image does not contain a recognizable problem, **When** the system analyzes it, **Then** the system returns a low confidence score with an appropriate message.

---

### User Story 4 - Cost Estimation (Priority: P2)

A user wants to know how much a service might cost before booking. They provide a description and category, and the system returns an estimated price range and duration.

**Why this priority**: Cost estimation helps users make informed booking decisions and reduces the number of inquiries about pricing.

**Independent Test**: Can be fully tested by submitting a cost estimation request and verifying the response contains cost range, duration, and confidence score.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they submit a cost estimation request with description and category, **Then** the system returns an estimated cost range, estimated duration, and confidence score.
2. **Given** the user includes optional images with their cost estimation request, **When** the system processes the request, **Then** the images are forwarded to the AI service and factored into the estimation.
3. **Given** the provided category is invalid or not recognized, **When** the user submits the request, **Then** the system returns a validation error indicating the category is not supported.

---

### User Story 5 - Provider Recommendation (Priority: P2)

A user wants to find the best provider for their specific problem. The system recommends providers based on the user's description and context.

**Why this priority**: Provider recommendations improve the user's ability to find the right professional, increasing booking completion rates.

**Independent Test**: Can be fully tested by submitting a provider recommendation request and verifying the response contains providers with match scores and explanations.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they request provider recommendations with their problem description, **Then** the system returns a list of recommended providers with match scores and explanations.
2. **Given** no suitable providers are found, **When** the user requests recommendations, **Then** the system returns an empty list with an appropriate message.

---

### User Story 6 - OCR Document Verification (Priority: P2)

During provider verification, a provider uploads an identity document. The system performs OCR to extract and validate the document information.

**Why this priority**: Automated document verification streamlines the provider on-boarding process and reduces manual review effort.

**Independent Test**: Can be fully tested by uploading a test document image and verifying the extracted data and validation status.

**Acceptance Scenarios**:

1. **Given** a provider user is authenticated, **When** they upload a valid government-issued ID document, **Then** the system returns extracted data, validation status, and confidence score.
2. **Given** the uploaded document image is blurry or unreadable, **When** the system analyzes it, **Then** the system returns a low confidence score with a recommendation to upload a clearer image.
3. **Given** the user uploads a non-document image (e.g., a landscape photo), **When** they submit it for OCR, **Then** the system returns an appropriate error or low confidence result.

---

### Edge Cases

- What happens when the AI service returns an unexpected or malformed response? The system should log the error and return a generic failure message.
- How does the system handle concurrent requests to a degraded AI service? The circuit breaker should prevent cascading failures by temporarily blocking requests after a threshold of failures.
- What happens when a file upload is interrupted mid-transfer? The system should reject incomplete uploads and not process partial files.
- How does the system handle requests that exceed the timeout duration? The request should be terminated, a timeout error returned, and the event logged.
- How does the system handle multiple rapid requests from a single user? Rate limiting should block excessive requests and return a rate limit exceeded error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST authenticate all AI feature requests via JWT verification before processing.
- **FR-002**: System MUST log every AI request including user identifier, feature type, request timestamp, response timestamp, processing time, and status.
- **FR-003**: System MUST reject AI requests from unauthenticated users with a standardized authentication error.
- **FR-004**: System MUST validate file uploads for type (images only: JPEG, PNG, WebP) and size (max 10 MB per file) before forwarding to AI service.
- **FR-005**: System MUST provide an AI Chat endpoint that accepts a text message and returns an AI-generated response.
- **FR-006**: System MUST provide a Service Classification endpoint that accepts a problem description and returns category, suggested service, and confidence score.
- **FR-007**: System MUST provide an Image Analysis endpoint that accepts image uploads and returns problem type, service category, confidence score, and recommendations.
- **FR-008**: System MUST provide a Cost Estimation endpoint that accepts description, category, and optional images, and returns estimated cost range, estimated duration, and confidence score.
- **FR-009**: System MUST provide a Provider Recommendation endpoint that forwards contextual information to the AI service and returns recommended providers, match scores, and explanations.
- **FR-010**: System MUST provide an OCR endpoint that accepts document images and returns extracted data, validation status, and confidence score.
- **FR-011**: System MUST forward all AI requests to the configured external AI service URL (configurable via environment variable).
- **FR-012**: System MUST enforce rate limiting on all AI endpoints (100 requests per minute per user).
- **FR-013**: System MUST implement request timeout handling (30-second timeout for AI service calls).
- **FR-014**: System MUST implement retry logic for transient AI service failures (maximum 3 retries with exponential backoff).
- **FR-015**: System MUST implement a circuit breaker pattern that blocks requests to the AI service after 5 consecutive failures and retries after a 30-second cooldown.
- **FR-016**: System MUST return standardized error responses for AI service unavailability without exposing internal error details.
- **FR-017**: System MUST persist a record of each AI request including feature type, status, and processing time for audit and monitoring purposes.
- **FR-018**: System MUST support adding new AI feature types without requiring changes to the core request handling, logging, or error handling workflows.
- **FR-019**: System MUST not block the rest of the application when AI services are degraded or unavailable.

### Key Entities *(include if feature involves data)*

- **AI Request Log**: Represents a record of every AI request processed by the gateway. Key attributes: request identifier, user reference, feature type (chat, classification, image analysis, cost estimation, provider recommendation, OCR), request timestamp, response timestamp, processing duration, and status (success, failed, timeout).
- **AI Service Provider**: Represents a configured external AI service endpoint. Key attributes: provider name, base URL, health status, and configuration (timeout, retry count, circuit breaker state).

## API Contract & DTOs *(mandatory)*

- **DTO-001** - `ChatRequest`: Accepts `message` (string, required, 1-2000 characters). Validated for non-empty content.
- **DTO-002** - `ChatResponse`: Returns `reply` (string), `conversationId` (optional, for future context support).
- **DTO-003** - `ClassifyServiceRequest`: Accepts `description` (string, required, 10-1000 characters). Validated for minimum length.
- **DTO-004** - `ClassifyServiceResponse`: Returns `category` (string), `suggestedService` (string), `confidenceScore` (number, 0-1).
- **DTO-005** - `AnalyzeImageRequest`: Accepts `image` (file, required, JPEG/PNG/WebP, max 10 MB).
- **DTO-006** - `AnalyzeImageResponse`: Returns `problemType` (string), `serviceCategory` (string), `confidenceScore` (number, 0-1), `recommendations` (array of strings).
- **DTO-007** - `EstimateCostRequest`: Accepts `description` (string, required), `category` (string, required), `images` (array of files, optional, max 5 files).
- **DTO-008** - `EstimateCostResponse`: Returns `estimatedCostRange` (object with `min` and `max`), `estimatedDuration` (string), `confidenceScore` (number, 0-1).
- **DTO-009** - `RecommendProviderRequest`: Accepts `description` (string, required), `location` (optional), `category` (optional).
- **DTO-010** - `RecommendProviderResponse`: Returns array of `recommendedProviders` each with `providerId`, `matchScore` (number, 0-1), `explanation` (string).
- **DTO-011** - `OcrRequest`: Accepts `documentImage` (file, required, JPEG/PNG/WebP, max 10 MB), `documentType` (string, required: national_id, passport, professional_license).
- **DTO-012** - `OcrResponse`: Returns `extractedData` (object), `validationStatus` (string: verified, suspected_fraud, unclear), `confidenceScore` (number, 0-1).
- **DTO-013** - `ErrorResponse`: Returns `success` (boolean, false), `errorCode` (string), `message` (string). Used for all error scenarios.
- **SWAG-001**: All endpoints must have Swagger decorators with request/response examples, error examples, and authentication requirements documented.

### Measurable Outcomes

- **SC-001**: All AI feature requests are processed and a response returned to the user within 30 seconds under normal conditions.
- **SC-002**: System supports up to 100 concurrent AI requests without significant degradation in response time.
- **SC-003**: At least 99.9% of AI requests are logged with complete audit trail information.
- **SC-004**: AI service failures do not cascade to other parts of the application; the rest of the platform continues operating normally.
- **SC-005**: File uploads that violate size or type constraints are rejected within 2 seconds of upload initiation.
- **SC-006**: Rate-limited users receive a clear error message with information about when they can retry.
- **SC-007**: After 5 consecutive AI service failures, the system automatically stops sending requests to the AI service for at least 30 seconds, preventing unnecessary load on the AI service and preserving system resources.

## Assumptions

- Users have stable internet connectivity and can reach the Herfa platform.
- The external AI service (Python FastAPI) will be developed separately and will adhere to the contract defined by the request and response DTOs.
- The AI service URL will be provided via the `AI_SERVICE_URL` environment variable. Default is `http://localhost:8000`.
- File uploads are limited to image files only (JPEG, PNG, WebP) with a maximum size of 10 MB per file and maximum 5 files per request.
- Rate limiting is set at 100 requests per minute per user for the initial implementation, adjustable via configuration.
- Request timeout for AI service calls is set to 30 seconds.
- Retry logic uses exponential backoff starting at 100 ms, with a maximum of 3 retries.
- Circuit breaker trips after 5 consecutive failures and resets after a 30-second cooldown period.
- Response caching is out of scope for the initial implementation and may be added in a future iteration.
- AI request logs are retained for auditing and monitoring purposes; retention period follows platform-wide data retention policies (assumed 1 year).
- The system reuses the existing JWT authentication infrastructure already in place.
- OCR verification is only available to users who are part of the provider verification flow.
