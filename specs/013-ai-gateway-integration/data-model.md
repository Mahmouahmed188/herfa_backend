# Data Model: AI Gateway & Integration Module

## Entity: AiRequestLog

Persistent audit log for every request processed through the AI gateway.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID (PK) | Auto-generated | Primary key |
| userId | UUID (FK → users.id) | NOT NULL, indexed | User who made the request |
| featureType | Enum | NOT NULL, indexed | One of: chat, classification, image_analysis, cost_estimation, provider_recommendation, ocr |
| requestPayload | JSONB | NOT NULL | The request DTO sent by the user |
| responsePayload | JSONB | NULLABLE | The response received from AI service (null if failed) |
| status | Enum | NOT NULL, indexed | One of: pending, success, failed, timeout, rate_limited, circuit_open |
| processingTime | Integer (ms) | NULLABLE | Duration of the AI service call |
| errorMessage | Text | NULLABLE | Error details if status is not success |
| ipAddress | VarChar(45) | NULLABLE | Client IP for audit |
| createdAt | Timestamp | Auto, NOT NULL | When the request was received |
| updatedAt | Timestamp | Auto, NOT NULL | Last update time |

**Indexes:**
- `IDX_ai_request_log_user_id` on `userId`
- `IDX_ai_request_log_feature_type` on `featureType`
- `IDX_ai_request_log_status` on `status`
- `IDX_ai_request_log_created_at` on `createdAt`
- `IDX_ai_request_log_user_feature` on `(userId, featureType)`

**Validation Rules:**
- `userId` must reference an existing user (FK constraint)
- `featureType` must be a valid AiFeatureType enum value
- `requestPayload` must be valid JSON
- `createdAt` and `updatedAt` are auto-managed

---

## Entity: AiHealthMonitor

Tracks circuit breaker state and health metrics for the external AI service.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID (PK) | Auto-generated | Primary key |
| serviceName | VarChar(100) | NOT NULL, UNIQUE | Identifier for the AI service endpoint |
| state | Enum | NOT NULL, default: closed | One of: closed, open, half_open |
| consecutiveFailures | Integer | NOT NULL, default: 0 | Consecutive failure count |
| lastFailureAt | Timestamp | NULLABLE | Timestamp of last failure |
| lastSuccessAt | Timestamp | NULLABLE | Timestamp of last success |
| cooldownUntil | Timestamp | NULLABLE | When circuit breaker will retry (null if state is closed) |
| totalRequests | Integer | NOT NULL, default: 0 | Lifetime request count |
| totalFailures | Integer | NOT NULL, default: 0 | Lifetime failure count |
| totalSuccesses | Integer | NOT NULL, default: 0 | Lifetime success count |
| createdAt | Timestamp | Auto, NOT NULL | When the monitor record was created |
| updatedAt | Timestamp | Auto, NOT NULL | Last update time |

**Indexes:**
- `IDX_ai_health_monitor_service` on `serviceName` (unique)
- `IDX_ai_health_monitor_state` on `state`

**Validation Rules:**
- `serviceName` must be unique
- `state` must be a valid CircuitBreakerState enum value
- `consecutiveFailures` must be >= 0
- `totalRequests` = `totalFailures` + `totalSuccesses` (maintained by application logic)

---

## Relationships

```
AiRequestLog.userId → users.id (M:1)
  - Many AI requests can belong to one user
  - FK with ON DELETE CASCADE (if user is deleted, logs are removed)

AiHealthMonitor (standalone entity, no FKs)
  - One record per AI service endpoint
```

## Enums

### AiFeatureType
- `chat` — AI chat assistance
- `classification` — Service classification
- `image_analysis` — Image problem detection
- `cost_estimation` — Cost estimation
- `provider_recommendation` — Provider recommendation
- `ocr` — OCR document verification

### AiRequestStatus
- `pending` — Request submitted, awaiting response
- `success` — AI service returned successfully
- `failed` — AI service returned an error
- `timeout` — Request exceeded timeout
- `rate_limited` — User exceeded rate limit
- `circuit_open` — Circuit breaker is open, request rejected

### CircuitBreakerState
- `closed` — Normal operation, requests pass through
- `open` — Circuit is tripped, requests are blocked
- `half_open` — Cooldown expired, single test request allowed

### OcrDocumentType
- `national_id` — National identity card
- `passport` — Passport document
- `professional_license` — Professional license/certificate

### OcrValidationStatus
- `verified` — Document verified successfully
- `suspected_fraud` — Document shows signs of tampering
- `unclear` — Document quality insufficient for verification
