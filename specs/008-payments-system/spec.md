# Feature Specification: Payments System

**Feature Branch**: `008-payments-system`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "Design and implement the Payments System for the Herfa Backend. This module manages all financial transactions related to bookings, including payment tracking, payment status management, refunds, and future payment gateway integrations."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Customer Views and Tracks Payment for Booking (Priority: P1)

As a customer, I want to view the payment details and status for my booking so that I can track whether my payment has gone through and understand my financial commitments.

**Why this priority**: Core functionality — every booking creates a payment record, and customers need immediate visibility into their payment status. This is the primary user-facing feature of the payments module.

**Independent Test**: Can be tested by creating a booking, confirming a payment record is automatically associated, and verifying that the customer can retrieve its payment number, amount, status, and method through the payments endpoint.

**Acceptance Scenarios**:

1. **Given** I am a logged-in customer with an existing booking, **When** I navigate to my payment history, **Then** I see a list of all my payments with their statuses, amounts, and dates.
2. **Given** I have a payment in "pending" status for a booking, **When** I view that payment's details, **Then** I see the payment number, booking reference, amount, currency, payment method, and current status.
3. **Given** I attempt to access another customer's payment record, **When** I request its details, **Then** I receive an authorization error and my request is denied.
4. **Given** I am a logged-in customer, **When** I try to modify a payment record or change its status, **Then** I receive an authorization error and my action is denied.

---

### User Story 2 - Admin Manages Payment Status and Processes Refunds (Priority: P1)

As an admin, I want to update payment statuses and process refunds so that I can manage the financial lifecycle of bookings and handle disputes or cancellations.

**Why this priority**: Payment status management and refund processing are critical business functions that enable the platform to handle real-world financial operations.

**Independent Test**: Can be tested by finding a payment, transitioning its status through valid workflows (e.g., pending → authorized → paid), processing a full and partial refund against a paid payment, and verifying that audit logs capture each action.

**Acceptance Scenarios**:

1. **Given** I am an authenticated admin, **When** I update a payment's status from "pending" to "authorized", **Then** the status changes successfully and the action is recorded in the audit log.
2. **Given** I attempt an invalid status transition (e.g., "pending" to "refunded"), **When** I submit the update, **Then** the system rejects the transition with a validation error.
3. **Given** a payment is in "paid" status, **When** I process a full refund, **Then** the payment status changes to "refunded", a refund record is created with the full amount and reason, and the action is audited.
4. **Given** a payment is in "paid" status with an amount of $200, **When** I process a partial refund of $50, **Then** the payment status changes to "partially_refunded", a refund record is created for $50, and the remaining balance is preserved.
5. **Given** I attempt to refund an amount exceeding the original payment amount, **When** I submit the refund, **Then** the system rejects it with a validation error.
6. **Given** I attempt to refund a payment that is not in "paid" status, **When** I submit the refund request, **Then** the system rejects it with a validation error.

---

### User Story 3 - Provider Views Payments Related to Their Bookings (Priority: P2)

As a provider, I want to view payments associated with my bookings so that I can track which customers have paid and manage my expected revenue.

**Why this priority**: Providers need payment visibility to plan their work and understand their earnings, but they do not need to modify payments.

**Independent Test**: Can be tested by creating bookings linked to a specific provider, confirming payments are associated, and verifying the provider can view only their own booking payments.

**Acceptance Scenarios**:

1. **Given** I am a logged-in provider, **When** I view my payments, **Then** I see a list of payments for all my bookings with amounts and statuses.
2. **Given** I am a logged-in provider, **When** I attempt to access a payment for a booking that belongs to another provider, **Then** I receive an authorization error.
3. **Given** I am a logged-in provider, **When** I attempt to update a payment's status or modify a payment record, **Then** I receive an authorization error and my action is denied.

---

### Edge Cases

- What happens when a payment fails mid-transaction — the status transitions to "failed" and the booking remains unpaid.
- What happens when a payment is "cancelled" — the booking's payment is voided and no money changes hands.
- How does the system handle concurrent refund requests — the refund amount validation against the original payment must be atomic to prevent over-refunding.
- What happens when a payment is in "partially_refunded" status and another partial refund is requested — the cumulative refunded amount must not exceed the original payment amount.
- What happens when a booking is cancelled after payment — the admin can process a refund to return funds to the customer.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST automatically create a payment record for every new booking.
- **FR-002**: System MUST generate a unique payment number for each payment record.
- **FR-003**: System MUST support the following payment statuses: pending, authorized, paid, failed, refunded, partially_refunded, cancelled.
- **FR-004**: System MUST validate all payment status transitions and reject invalid transitions with appropriate error messages.
- **FR-005**: System MUST support the following payment methods: Cash, Credit Card, Debit Card, Wallet.
- **FR-006**: System MUST be designed to accommodate future payment methods (Apple Pay, Google Pay, Vodafone Cash, Fawry, Paymob, Stripe) without structural changes.
- **FR-007**: System MUST allow customers to view their own payment records and payment history.
- **FR-008**: System MUST prevent customers from modifying payment records or changing payment status.
- **FR-009**: System MUST allow providers to view payments associated with their own bookings only.
- **FR-010**: System MUST prevent providers from modifying payment records or changing payment status.
- **FR-011**: System MUST allow admins to view all payment records across the platform.
- **FR-012**: System MUST allow admins to update payment status through valid transitions.
- **FR-013**: System MUST allow admins to process full refunds against paid payments.
- **FR-014**: System MUST allow admins to process partial refunds against paid payments.
- **FR-015**: System MUST validate that refund amount does not exceed the original payment amount.
- **FR-016**: System MUST validate that refunds are only allowed against payments in "paid" status.
- **FR-017**: System MUST create a refund record for every refund processed, storing refund amount, reason, and who processed it.
- **FR-018**: System MUST enforce JWT authentication on all payment endpoints.
- **FR-019**: System MUST enforce role-based authorization (customer, provider, admin) on all payment actions.
- **FR-020**: System MUST audit-log all critical payment actions including payment creation, status updates, refund processing, and payment failures.
- **FR-021**: System MUST support filtering payments by status, payment method, customer, provider, booking, and date range.
- **FR-022**: System MUST support pagination, sorting, and search by payment number on all list endpoints.
- **FR-023**: System MUST trigger notifications when payment is completed, payment fails, refund is issued, and payment is cancelled.
- **FR-024**: System MUST validate that payment amount is greater than zero.
- **FR-025**: System MUST require currency for all payments.
- **FR-026**: System MUST validate payment method against the list of supported methods.
- **FR-027**: System MUST create appropriate database indexes to optimize payment retrieval, reporting queries, and refund history lookup.
- **FR-028**: System MUST include architecture abstractions (provider interfaces) to enable future payment gateway integrations without modifying core payment logic.

### Key Entities

- **Payment**: Represents a financial transaction associated with a booking. Contains payment number, booking reference, customer and provider info, amount, currency, payment method, status, transaction reference, and timestamps.
- **Refund**: Represents a full or partial refund issued against a payment. Tracks refund amount, reason, who processed it, and when it was issued. Multiple refunds can exist per payment.
- **Payment Status**: Enumeration of valid statuses (pending, authorized, paid, failed, refunded, partially_refunded, cancelled) with defined transition rules.
- **Payment Method**: Enumeration of supported payment methods (Cash, Credit Card, Debit Card, Wallet) with architecture supporting future expansion.

## API Contract & DTOs *(mandatory)*

- **DTO-001**: Payment Response — includes payment number, amount, currency, payment method, payment status, transaction reference, booking details (id, reference), customer details (id, name), provider details (id, name), notes, paid at, created at, updated at.
- **DTO-002**: Payment List Response — paginated list of payments with total count, page, limit, and sorting metadata.
- **DTO-003**: Update Payment Status Request — new status value, reason/notes for the change.
- **DTO-004**: Refund Request — refund amount, refund reason.
- **DTO-005**: Refund Response — refund id, payment id, refund amount, refund reason, refunded by, refunded at, created at.
- **DTO-006**: Payment Filter Parameters — status, payment method, customer id, provider id, booking id, date range (from, to), search query (payment number), sort field, sort order, page, limit.
- **SWAG-001**: GET /payments — Customer payment history. Requires JWT auth (customer role). Accepts filter and pagination query params. Returns paginated payment list.
- **SWAG-002**: GET /payments/:id — Customer payment detail. Requires JWT auth (customer role). Returns single payment with full details.
- **SWAG-003**: GET /provider/payments — Provider payment list for own bookings. Requires JWT auth (provider role). Accepts filter and pagination query params.
- **SWAG-004**: GET /provider/payments/:id — Provider payment detail for own booking. Requires JWT auth (provider role).
- **SWAG-005**: GET /admin/payments — Admin view of all payments. Requires JWT auth (admin role). Accepts filter and pagination query params.
- **SWAG-006**: GET /admin/payments/:id — Admin view of any payment. Requires JWT auth (admin role).
- **SWAG-007**: PATCH /admin/payments/:id/status — Admin updates payment status. Requires JWT auth (admin role). Body includes new status and optional notes.
- **SWAG-008**: POST /admin/payments/:id/refund — Admin processes refund. Requires JWT auth (admin role). Body includes refund amount and reason.

### Measurable Outcomes

- **SC-001**: Customers can view their payment history and payment details within their account in under 2 seconds for any number of payments.
- **SC-002**: Status transitions are validated and processed in under 1 second from admin submission.
- **SC-003**: Refund processing completes in under 2 seconds, including validation, record creation, and audit logging.
- **SC-004**: Payment list queries with filtering and pagination return results in under 1 second for up to 10,000 payments.
- **SC-005**: Role-based access controls correctly block unauthorized actions (customer/provider modifying payments, provider viewing another's payments) 100% of the time.
- **SC-006**: Invalid status transitions are rejected with meaningful error messages 100% of the time.
- **SC-007**: Refund amount validation prevents over-refunding (cumulative refunds exceeding original amount) 100% of the time.
- **SC-008**: 100% of critical payment actions (creation, status updates, refunds, failures) are captured in immutable audit logs.

## Assumptions

- The existing Authentication Module (JWT) and Users Module (roles, user profiles) are available and will be reused.
- The Booking Module is available and each booking has a unique identifier that can be referenced in payment records.
- The Notifications Module is available and supports event-driven integration for triggering payment-related notifications.
- Currency will default to a configurable system-wide currency (assumed to be EGP for local marketplace operations).
- Payment number format will be auto-generated by the system using a sequential or timestamp-based scheme.
- "Cash" payments are assumed to be collected offline; the system tracks the obligation rather than processing the transaction.
- Transaction reference for non-gateway methods (Cash, Wallet) may be optional or system-generated.
- Payment gateway integrations (Stripe, Paymob, Fawry, etc.) are explicitly out of scope for this feature and will be added in future iterations through defined abstraction interfaces.
- Audit logs will be stored in a dedicated audit table or external audit service presumed to exist in the platform.
- The system will support a single currency per payment (no multi-currency payments within a single record).
