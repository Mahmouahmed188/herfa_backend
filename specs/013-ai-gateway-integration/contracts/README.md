# API Contracts: AI Gateway Module

## Internal REST Endpoints (NestJS → Client)

All endpoints are prefixed with `/api/v1/ai`. All require JWT authentication via `Authorization: Bearer <token>` header.

### POST /api/v1/ai/chat

**Description**: Send a chat message and get an AI-generated response.

**Request Body** (`ChatRequest`):
```json
{
  "message": "How do I fix a leaking faucet?"
}
```

**Validation**:
- `message`: string, required, 1-2000 characters

**Response** (`ChatResponse`, 200):
```json
{
  "reply": "To fix a leaking faucet, first turn off the water supply...",
  "conversationId": null
}
```

**Errors**: 401 (unauthorized), 429 (rate limited), 503 (AI service unavailable)

---

### POST /api/v1/ai/classify

**Description**: Classify a maintenance problem into a service category.

**Request Body** (`ClassifyServiceRequest`):
```json
{
  "description": "The bathroom sink is leaking and water is pooling on the floor"
}
```

**Validation**:
- `description`: string, required, 10-1000 characters

**Response** (`ClassifyServiceResponse`, 200):
```json
{
  "category": "plumbing",
  "suggestedService": "Faucet Repair",
  "confidenceScore": 0.95
}
```

**Errors**: 401, 422 (validation), 429, 503

---

### POST /api/v1/ai/analyze-image

**Description**: Upload an image for AI-powered problem detection.

**Request** (multipart/form-data):
- `image`: file, required, JPEG/PNG/WebP, max 10MB

**Response** (`AnalyzeImageResponse`, 200):
```json
{
  "problemType": "water_leak",
  "serviceCategory": "plumbing",
  "confidenceScore": 0.88,
  "recommendations": [
    "Plumber inspection recommended",
    "Check pipe joints for corrosion"
  ]
}
```

**Errors**: 400 (invalid file), 401, 413 (file too large), 415 (unsupported format), 429, 503

---

### POST /api/v1/ai/estimate-cost

**Description**: Get cost estimation for a service based on description and category.

**Request Body** (`EstimateCostRequest`):
```json
{
  "description": "Fix a leaking bathroom faucet",
  "category": "plumbing",
  "images": []
}
```

**Response** (`EstimateCostResponse`, 200):
```json
{
  "estimatedCostRange": {
    "min": 80,
    "max": 150
  },
  "estimatedDuration": "1-2 hours",
  "confidenceScore": 0.85
}
```

**Errors**: 401, 422 (invalid category), 429, 503

---

### POST /api/v1/ai/recommend-providers

**Description**: Get provider recommendations based on problem description.

**Request Body** (`RecommendProviderRequest`):
```json
{
  "description": "Need a plumber to fix leaking pipes",
  "location": "Amman",
  "category": "plumbing"
}
```

**Response** (`RecommendProviderResponse`, 200):
```json
{
  "recommendedProviders": [
    {
      "providerId": "uuid-here",
      "matchScore": 0.92,
      "explanation": "Specializes in pipe repair with 5 years experience"
    }
  ]
}
```

**Errors**: 401, 429, 503

---

### POST /api/v1/ai/ocr

**Description**: Perform OCR on a document image for identity verification.

**Request** (multipart/form-data):
- `documentImage`: file, required, JPEG/PNG/WebP, max 10MB
- `documentType`: string, required, one of: `national_id`, `passport`, `professional_license`

**Response** (`OcrResponse`, 200):
```json
{
  "extractedData": {
    "fullName": "John Doe",
    "documentNumber": "AB123456",
    "dateOfBirth": "1990-01-15",
    "nationality": "JO"
  },
  "validationStatus": "verified",
  "confidenceScore": 0.96
}
```

**Errors**: 400 (invalid file), 401, 413, 415, 422 (invalid document type), 429, 503

---

## Common Error Response

All errors use a standardized structure (`ErrorResponse`):

```json
{
  "success": false,
  "errorCode": "AI_SERVICE_UNAVAILABLE",
  "message": "AI service is temporarily unavailable. Please try again later."
}
```

**Error Codes**:
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `VALIDATION_ERROR` | 422 | Request failed validation |
| `RATE_LIMIT_EXCEEDED` | 429 | User exceeded rate limit |
| `FILE_TOO_LARGE` | 413 | Upload exceeds max size |
| `UNSUPPORTED_FILE_TYPE` | 415 | File format not supported |
| `AI_SERVICE_UNAVAILABLE` | 503 | AI service is down or circuit open |
| `AI_REQUEST_TIMEOUT` | 504 | AI service did not respond in time |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## External AI Service Contract (NestJS → Python FastAPI)

The NestJS module forwards validated requests to the external AI service at `AI_SERVICE_URL`.

### Chat
```
POST {AI_SERVICE_URL}/ai/chat
Body: { "message": "..." }
Response: { "reply": "...", "conversationId": null }
```

### Classify
```
POST {AI_SERVICE_URL}/ai/classify
Body: { "description": "..." }
Response: { "category": "...", "suggestedService": "...", "confidenceScore": 0.95 }
```

### Analyze Image
```
POST {AI_SERVICE_URL}/ai/analyze-image
Body: multipart/form-data with image file
Response: { "problemType": "...", "serviceCategory": "...", "confidenceScore": 0.88, "recommendations": [] }
```

### Estimate Cost
```
POST {AI_SERVICE_URL}/ai/estimate-cost
Body: { "description": "...", "category": "...", "images": [] }
Response: { "estimatedCostRange": { "min": 80, "max": 150 }, "estimatedDuration": "...", "confidenceScore": 0.85 }
```

### Recommend Providers
```
POST {AI_SERVICE_URL}/ai/recommend-providers
Body: { "description": "...", "location": "...", "category": "..." }
Response: { "recommendedProviders": [{ "providerId": "...", "matchScore": 0.92, "explanation": "..." }] }
```

### OCR
```
POST {AI_SERVICE_URL}/ai/ocr
Body: multipart/form-data with documentImage + documentType field
Response: { "extractedData": {...}, "validationStatus": "verified", "confidenceScore": 0.96 }
```

### External Service Error Response
```json
{
  "error": "string",
  "detail": "string"
}
```

The NestJS gateway maps external errors to standardized `ErrorResponse` format before returning to the client.
