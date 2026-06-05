# Address Management — API Contracts

**Date**: 2026-06-05 | **Input**: [spec.md](../spec.md)

## Overview

This document defines the request/response DTOs, validation rules, and Swagger documentation requirements for the Address Management System. All DTOs follow the existing codebase conventions (class-validator + @nestjs/swagger).

---

## DTO-001: CreateAddressDto

**Purpose**: Request body for POST /addresses

| Field | Type | Required | Validation | Swagger Example |
|-------|------|----------|------------|-----------------|
| label | string | yes | @IsString(), @MaxLength(100) | "Home" |
| fullAddress | string | yes | @IsString(), @MinLength(5) | "123 Main Street, Building 4" |
| buildingNumber | string | yes | @IsString() | "15A" |
| floorNumber | number | no | @IsOptional(), @IsInt(), @Min(0) | 3 |
| apartmentNumber | number | no | @IsOptional(), @IsInt(), @Min(0) | 12 |
| city | string | yes | @IsString(), @MaxLength(100) | "Cairo" |
| area | string | yes | @IsString(), @MaxLength(100) | "Maadi" |
| latitude | number | yes | @IsNumber(), @Min(-90), @Max(90) | 30.0444 |
| longitude | number | yes | @IsNumber(), @Min(-180), @Max(180) | 31.2357 |

**Swagger decorators**: All required fields use `@ApiProperty()` with `description`, `example`; optional fields use `@ApiPropertyOptional()`.

---

## DTO-002: UpdateAddressDto

**Purpose**: Request body for PATCH /addresses/:id

Same fields as CreateAddressDto, but all fields are optional (partial update via PATCH).

**Validation**: Each field uses `@IsOptional()` plus its type validator.

---

## DTO-003: AddressResponseDto

**Purpose**: Response body for all address endpoints

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Address ID |
| userId | string (uuid) | Owner user ID |
| label | string | Address label |
| fullAddress | string | Full address text |
| buildingNumber | string | Building number |
| floorNumber | number (nullable) | Floor number |
| apartmentNumber | number (nullable) | Apartment number |
| city | string | City |
| area | string | Area/district |
| latitude | number | Latitude |
| longitude | number | Longitude |
| isDefault | boolean | Whether this is the default address |
| createdAt | string (ISO datetime) | Creation timestamp |
| updatedAt | string (ISO datetime) | Last update timestamp |

**Swagger decorators**: All fields use `@ApiProperty()` with `description`.

---

## DTO-004: AddressFilterDto

**Purpose**: Query parameters for GET /addresses (list)

Extends `PaginationDto` from `src/common/dto/pagination.dto.ts`.

| Field | Type | Required | Default | Values |
|-------|------|----------|---------|--------|
| page | number | no | 1 | min 1 |
| limit | number | no | 20 | min 1, max 100 |
| sortBy | enum | no | createdAt | 'createdAt' \| 'isDefault' |
| sortOrder | enum | no | DESC | 'ASC' \| 'DESC' |

**Validation**: `@IsEnum()` for enum fields, `@Type(() => Number)` for numeric query params.

---

## DTO-005: AdminAddressFilterDto

**Purpose**: Query parameters for GET /admin/addresses (admin list)

Extends `AddressFilterDto` with an additional required field:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string (uuid) | yes | Filter addresses by customer |
| page | number | no | Pagination (inherited) |
| limit | number | no | Pagination (inherited) |
| sortBy | enum | no | Sorting (inherited) |
| sortOrder | enum | no | Sort order (inherited) |

---

## Endpoints Summary

### Customer Endpoints (`@Controller('addresses')`)

| Method | Path | Auth | DTO In | DTO Out | Description |
|--------|------|------|--------|---------|-------------|
| POST | /addresses | JWT Customer | CreateAddressDto | AddressResponseDto | Create new address |
| GET | /addresses | JWT Customer | AddressFilterDto (query) | AddressResponseDto[] (paginated) | List my addresses |
| GET | /addresses/:id | JWT Customer | — | AddressResponseDto | Get address by ID |
| PATCH | /addresses/:id | JWT Customer | UpdateAddressDto | AddressResponseDto | Update address |
| DELETE | /addresses/:id | JWT Customer | — | 204 No Content | Delete address |
| PATCH | /addresses/:id/set-default | JWT Customer | — | AddressResponseDto | Set as default address |

### Admin Endpoints (`@Controller('admin/addresses')`)

| Method | Path | Auth | DTO In | DTO Out | Description |
|--------|------|------|--------|---------|-------------|
| GET | /admin/addresses | JWT Admin | AdminAddressFilterDto (query) | AddressResponseDto[] (paginated) | List customer addresses |
| GET | /admin/addresses/:id | JWT Admin | — | AddressResponseDto | Get address by ID |

---

## Swagger Documentation Requirements

Per Constitution Principle VI:

- **Every DTO field**: Must have `@ApiProperty()` or `@ApiPropertyOptional()` with `description` and `example`
- **Every endpoint**: Must have `@ApiOperation({ summary, description })`
- **Every endpoint**: Must have `@ApiResponse()` for 200, 201, 400, 401, 403, 404, 500
- **Controller**: Must have `@ApiTags()`, `@ApiBearerAuth()`
- **Response examples**: Include real-looking UUIDs and coordinate values

---

## Error Response Format

Following Constitution Principle X (structured errors):

```json
{
  "success": false,
  "message": "Address label is required",
  "errorCode": "ADDRESS_LABEL_REQUIRED"
}
```

| HTTP Status | Error Code | When |
|-------------|------------|------|
| 400 | ADDRESS_LABEL_REQUIRED | Missing required label |
| 400 | ADDRESS_LATITUDE_INVALID | Latitude out of range |
| 400 | ADDRESS_LONGITUDE_INVALID | Longitude out of range |
| 400 | ADDRESS_DEFAULT_ALREADY_EXISTS | Concurrent default-set race condition |
| 401 | UNAUTHORIZED | Missing/invalid JWT |
| 403 | FORBIDDEN | Accessing another user's address |
| 404 | ADDRESS_NOT_FOUND | Address ID doesn't exist |
| 409 | ADDRESS_DEFAULT_CONFLICT | Default constraint violation |
