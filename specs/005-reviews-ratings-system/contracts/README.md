# API Contracts: Reviews & Ratings System

## Overview

All endpoints follow the existing Herfa API conventions:
- Base path: `/reviews` (customer), `/provider/reviews` (provider), `/admin/reviews` (admin)
- Auth: JWT Bearer token via `@ApiBearerAuth()` except public endpoints
- Response format: `{ data: ..., timestamp: "..." }` (via `TransformInterceptor`)
- Error format: `{ statusCode, message, error, timestamp, path }` (via `AllExceptionsFilter`)

## Endpoints

### Customer Endpoints (`/reviews`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/reviews` | Customer | Create review for a completed booking |
| GET | `/reviews/mine` | Customer | List my submitted reviews |
| GET | `/reviews/:id` | Customer | Get a single review |
| PATCH | `/reviews/:id` | Customer | Edit my review (within 24h) |
| DELETE | `/reviews/:id` | Customer | Delete my review (within 24h) |

### Provider Endpoints (`/provider/reviews`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/provider/reviews` | Provider | List reviews I've received |
| GET | `/provider/reviews/stats` | Provider | Get my rating statistics |

### Public Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/providers/:providerId/reviews` | None | Public paginated reviews for a provider |
| GET | `/providers/:providerId/rating` | None | Public rating stats for a provider |

### Admin Endpoints (`/admin/reviews`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/reviews` | Admin | List all reviews (all providers) |
| GET | `/admin/reviews/:id` | Admin | Get review details |
| DELETE | `/admin/reviews/:id` | Admin | Remove a review (moderation) |
| GET | `/admin/reviews/moderation-log` | Admin | View moderation action log |

## DTOs

See individual DTO files in `src/modules/reviews/dto/` for full validation rules and Swagger decorators.
