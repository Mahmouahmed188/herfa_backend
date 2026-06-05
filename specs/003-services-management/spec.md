# Feature Specification: Services Management

**Feature Branch**: `003-services-management`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description for Services Management Module.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Provider Service Management (Priority: P1)

As a Provider, I want to create and manage my service listings so that customers can discover and book my services.

**Why this priority**: Service listings are the primary product offering on the marketplace. Without services, customers have nothing to browse or book.

**Independent Test**: A provider can create a service with all required fields and verify it appears in their own service list.

**Acceptance Scenarios**:

1. **Given** an authenticated Provider user, **When** they create a new service "Faucet Installation" under the "Plumbing" category with a price of 150 SAR and 60-minute duration, **Then** the service is saved and visible in their portfolio.
2. **Given** a Provider has multiple services, **When** they view their service list, **Then** they see only their own services (not other providers' services).
3. **Given** an existing service, **When** the Provider updates its title, description, or price, **Then** the changes are reflected immediately.
4. **Given** a service that is no longer offered, **When** the Provider deactivates it, **Then** it no longer appears in customer search results.

---

### User Story 2 - Customer Service Discovery (Priority: P1)

As a Customer, I want to browse and search available services so that I can find and book the service I need.

**Why this priority**: Service discovery is the core customer experience. Without it, customers cannot find providers or book services.

**Independent Test**: A customer can filter services by category and price range and verify that results match the applied filters.

**Acceptance Scenarios**:

1. **Given** multiple services across different categories, **When** a Customer filters by "Plumbing" category, **Then** only plumbing services are shown.
2. **Given** many services, **When** a Customer searches by title keyword "repair", **Then** only services with "repair" in the title are returned.
3. **Given** a large number of services, **When** a Customer requests the next page of results, **Then** pagination works correctly.
4. **Given** a Customer views a service, **When** they open its details page, **Then** they see the title, description, price, duration, images, and provider information.

---

### User Story 3 - Service Image Management (Priority: P2)

As a Provider, I want to add and manage images for my services so that customers can see visual examples of my work.

**Why this priority**: Images enhance customer confidence but are not essential for initial service listing functionality.

**Independent Test**: A provider can upload multiple images to a service and designate a primary image, then verify all images are returned in the service details.

**Acceptance Scenarios**:

1. **Given** a service with no images, **When** the Provider adds three images, **Then** all three images are stored and linked to the service.
2. **Given** a service with multiple images, **When** the Provider sets a different image as primary, **Then** the primary flag updates correctly.
3. **Given** a service with images, **When** a Customer views the service, **Then** they can see all images with the primary image displayed first.

---

### Edge Cases

- **Duplicate Service Titles**: Providers should be able to create services with the same title as long as they are in different categories or have different descriptions; no uniqueness constraint on title alone.
- **Category Deletion Impact**: If a category is deactivated, existing services under that category should remain but cannot be edited to add new services to a deactivated category.
- **Provider Deactivation**: If a provider account is suspended, their services should automatically become invisible to customers.
- **Price Validation**: Service price must be strictly greater than zero; zero and negative prices are rejected.
- **Empty Service Portfolio**: New providers with no services should show an empty list, not an error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow authenticated Providers to create a service with title, description, category, base price, currency, and estimated duration.
- **FR-002**: The system MUST allow Providers to update and delete only their own services.
- **FR-003**: Providers MUST be able to toggle a service between active and inactive status.
- **FR-004**: Customers MUST be able to browse all active services with filtering by category, provider, and price range.
- **FR-005**: Customers MUST be able to search services by title keywords.
- **FR-006**: The system MUST support pagination and sorting for service listings.
- **FR-007**: The system MUST allow Providers to upload and manage multiple images per service, including designating a primary image.
- **FR-008**: Every service MUST belong to a valid, active category.
- **FR-009**: The system MUST restrict service creation, editing, and deletion to the owning Provider only.
- **FR-010**: Admin users MUST be able to view all services and deactivate inappropriate ones. [NEEDS CLARIFICATION: what constitutes "moderation" — can admins edit services, or only deactivate/flag them?]
- **FR-011**: Inactive services MUST NOT appear in customer search results or listings.
- **FR-012**: If a provider's account is suspended, all their services MUST automatically become inactive.

### Key Entities *(include if feature involves data)*

- **Service**: A professional service offered by a provider. Includes title, description, category, base price, currency, estimated duration, and active status. Belongs to one Provider and one Category. Can have multiple images.
- **ServiceImage**: An image associated with a service. Includes image URL and a boolean flag indicating whether it is the primary image. Belongs to one Service.

## API Contract & DTOs *(mandatory)*

- **DTO-001**: CreateServiceDto (title, description, categoryId, basePrice, currency, estimatedDurationMinutes)
- **DTO-002**: UpdateServiceDto (title, description, basePrice, currency, estimatedDurationMinutes, isActive)
- **DTO-003**: ServiceImageDto (imageUrl, isPrimary)
- **DTO-004**: ServiceFilterDto (categoryId, providerId, minPrice, maxPrice, search, page, limit, sortBy, sortOrder)
- **SWAG-001**: Swagger documentation for all service endpoints with request/response examples, validation errors, authentication requirements, and pagination schemas.

### Measurable Outcomes

- **SC-001**: Service creation completes (from form submission to confirmation) in under 3 seconds under normal conditions.
- **SC-002**: Customers can find relevant services within 2 searches on average.
- **SC-003**: Service listings with filtering return results within 2 seconds for up to 10,000 services.
- **SC-004**: 100% of unauthorized modification attempts (non-owner provider, customer) are blocked.
- **SC-005**: 95% of providers successfully create their first service without external support.

## Assumptions

- Image uploads are handled by a separate file upload service; this module only stores image URLs.
- The currency is configurable per marketplace; default is SAR for initial deployment.
- Service duration is defined in minutes; scheduling integration with a future Booking module is out of scope for this feature.
- The existing authentication and authorization system (JWT + Role Guards) will be reused.
- The Categories Module and Provider Profiles Module are already implemented and available for integration.
- Dynamic pricing, discounts, and promotions are explicitly out of scope for this feature.
