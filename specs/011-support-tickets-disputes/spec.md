# Feature Specification: Support Tickets & Disputes System

**Feature Branch**: `011-support-tickets-disputes`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "Support Tickets & Disputes System for the Herfa Backend"

## User Scenarios & Testing

### User Story 1 - Customer Creates a Support Ticket (Priority: P1)

A customer encounters a technical issue while using the platform. They create a support ticket by selecting a category, providing a subject and description, and submitting it. The system confirms the ticket creation with a unique ticket number and notifies the customer that an admin will review it.

**Why this priority**: Ticket creation is the core entry point for the entire support workflow. Without it, no support requests can be lodged, reviewed, or resolved.

**Independent Test**: A customer can open the support section, fill in the required fields (category, subject, description), submit, and receive a confirmation with a ticket number.

**Acceptance Scenarios**:

1. **Given** a customer is authenticated, **When** they submit a new support ticket with a valid category, subject, and description, **Then** the system creates the ticket and returns a unique ticket number.
2. **Given** a customer is authenticated, **When** they submit a ticket without a subject, **Then** the system rejects the request with a validation error.
3. **Given** a customer is authenticated, **When** they submit a ticket without a description, **Then** the system rejects the request with a validation error.

---

### User Story 2 - Provider Opens a Booking Dispute (Priority: P1)

A provider believes they were underpaid for a completed booking. They open a dispute against the booking by providing a title, description, and linking the specific booking. The system creates the dispute and notifies both the customer and the admin team.

**Why this priority**: Dispute resolution is critical for trust on the platform. Without it, financial disagreements between parties have no structured resolution path.

**Independent Test**: A provider can select a completed booking, file a dispute with a title and description, and see the dispute appear in their dispute list.

**Acceptance Scenarios**:

1. **Given** a provider is authenticated and has a completed booking, **When** they submit a dispute for that booking with a title and description, **Then** the system creates the dispute with status "open".
2. **Given** a user is authenticated, **When** they attempt to create a dispute for a booking they are not a participant of, **Then** the system rejects the request.
3. **Given** a user is authenticated, **When** they attempt to create a dispute for a non-existent booking, **Then** the system rejects the request.

---

### User Story 3 - Admin Resolves a Dispute (Priority: P1)

An admin reviews an open dispute, examines the booking details, reviews evidence submitted by both parties, and resolves the dispute in favor of the customer. The system updates the dispute status, records the resolution details, and notifies both parties.

**Why this priority**: Resolution is the terminal outcome that restores trust and closes financial disagreements. Without it, disputes remain unresolved indefinitely.

**Independent Test**: An admin can view all disputes, select one, review details and evidence, and resolve it by choosing a favored party and providing resolution notes.

**Acceptance Scenarios**:

1. **Given** an admin is authenticated and reviews an open dispute with evidence, **When** they resolve it in favor of the customer, **Then** the dispute status changes to "resolved_customer" and notifications are sent.
2. **Given** an admin is authenticated and reviews an open dispute with evidence, **When** they resolve it in favor of the provider, **Then** the dispute status changes to "resolved_provider" and notifications are sent.
3. **Given** an admin is authenticated, **When** they attempt to resolve an already-closed dispute, **Then** the system rejects the request.

---

### User Story 4 - Customer Replies to Ticket Conversation (Priority: P2)

A customer receives a response from support staff asking for more details. The customer replies to the ticket with additional information. The message is appended to the ticket conversation and support staff is notified.

**Why this priority**: Two-way conversation is essential for effective issue resolution. Without messaging, support staff cannot gather additional information from the ticket creator.

**Independent Test**: A customer can open an existing ticket, type a message, submit it, and see the message appear in the ticket's message thread.

**Acceptance Scenarios**:

1. **Given** a customer has an open ticket, **When** they submit a message, **Then** the message is added to the ticket conversation and the admin is notified.
2. **Given** a customer has a closed ticket, **When** they attempt to submit a message, **Then** the system rejects the request.

---

### User Story 5 - Admin Manages Support Ticket Queue (Priority: P2)

An admin logs in and views all open tickets, filters by priority and category, assigns a high priority to an urgent ticket, changes a ticket status to "in_progress", and assigns themselves as the responsible admin.

**Why this priority**: Queue management enables admins to triage, prioritize, and process tickets efficiently at scale.

**Independent Test**: An admin can view all tickets, apply filters (status, category, priority), update a ticket's priority, change its status, and claim ownership.

**Acceptance Scenarios**:

1. **Given** an admin is authenticated, **When** they view the ticket list with status filter "open", **Then** only open tickets are displayed.
2. **Given** an admin is viewing a ticket, **When** they change its status from "open" to "in_progress", **Then** the status updates and an audit entry is created.
3. **Given** an admin is viewing a ticket, **When** they attempt an invalid status transition (e.g., "closed" to "open"), **Then** the system rejects the request.

---

### User Story 6 - Provider Uploads Dispute Evidence (Priority: P2)

A provider gathers screenshots and a PDF document as evidence for their dispute. They upload these files to the dispute. The system validates the file types and sizes, stores the files, and links them to the dispute.

**Why this priority**: Evidence is critical for informed dispute resolution. Without it, admins cannot make fair decisions.

**Independent Test**: A provider can open a dispute, upload an image file, and see the file listed in the dispute's evidence attachments.

**Acceptance Scenarios**:

1. **Given** a provider has an open dispute, **When** they upload a valid image file (JPG, PNG) under the size limit, **Then** the file is stored and linked to the dispute.
2. **Given** a provider has an open dispute, **When** they upload a file of an unsupported type (e.g., EXE), **Then** the system rejects the upload with an error.
3. **Given** a provider has an open dispute, **When** they upload a file exceeding the size limit, **Then** the system rejects the upload with an error.

### Edge Cases

- What happens when a user tries to create a dispute for a booking that is still in "pending" status (not yet completed or active)?
- How does the system handle a user who is both customer and provider for the same booking?
- What happens when a ticket creator is deactivated or deleted while a ticket is still open?
- How does the system handle concurrent status updates by two admins on the same ticket or dispute?
- What happens when evidence upload fails mid-transfer (partial upload)?
- How does the system handle a dispute filed against a booking that already has an open dispute?

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow customers and providers to create support tickets with a category, subject, and description.
- **FR-002**: System MUST automatically assign a unique, human-readable ticket number to each ticket.
- **FR-003**: System MUST allow customers and providers to view their own tickets and the associated message history.
- **FR-004**: System MUST allow authenticated users (customers, providers, admins) to reply to open or in-progress tickets with text messages.
- **FR-005**: System MUST enforce valid ticket status transitions: open → in_progress, in_progress → waiting_for_user, waiting_for_user → in_progress, any status → resolved, any status → closed.
- **FR-006**: System MUST allow customers and providers to create disputes linked to a completed or active booking.
- **FR-007**: System MUST validate that the user creating a dispute is a participant (customer or provider) of the related booking.
- **FR-008**: System MUST allow dispute participants and admins to upload evidence files to a dispute.
- **FR-009**: System MUST restrict evidence file uploads to allowed types (jpg, jpeg, png, gif, webp, pdf, doc, docx) and enforce maximum file sizes (10 MB for images, 25 MB for documents).
- **FR-010**: System MUST allow administrators to view all tickets and all disputes across the platform.
- **FR-011**: System MUST allow administrators to assign or change ticket priority levels (low, medium, high, urgent).
- **FR-012**: System MUST allow administrators to change ticket status following the valid transition rules defined in FR-005.
- **FR-013**: System MUST allow administrators to change dispute status following valid transitions: open → under_review, under_review → awaiting_evidence, awaiting_evidence → under_review, under_review → resolved_customer, under_review → resolved_provider, resolved_customer → closed, resolved_provider → closed.
- **FR-014**: System MUST allow administrators to resolve a dispute by specifying the resolution outcome and the favored party.
- **FR-015**: System MUST restrict customers and providers to accessing only their own tickets and disputes; administrators MUST have full access to all records.
- **FR-016**: System MUST trigger notification events when a ticket is created, updated, messaged, or closed, and when a dispute is opened or resolved.
- **FR-017**: System MUST record immutable audit log entries for all status changes, priority changes, resolution actions, and evidence uploads.
- **FR-018**: System MUST support filtering tickets and disputes by status, category, priority, user, and date range.
- **FR-019**: System MUST support pagination and sorting for ticket and dispute list endpoints.
- **FR-020**: System MUST support searching tickets by ticket number.

### Key Entities

- **SupportTicket**: Represents a support request filed by a customer or provider. Contains category, priority, status, subject, description, and assignment information. Linked to the user who created it and optionally to an admin who is handling it.
- **TicketMessage**: A single message within a ticket conversation. Linked to a support ticket and the sender (user or admin). Stored permanently for audit purposes.
- **Dispute**: Represents a booking-related disagreement between a customer and a provider. Contains status, title, description, resolution outcome, and resolution metadata. Linked to the booking and the involved parties.
- **DisputeEvidence**: A file submitted as evidence in support of a dispute. Contains file URL, file type metadata, and uploader information. Linked to a dispute.

## API Contract & DTOs

- **DTO-001**: `CreateTicketDto` — subject (required), description (required), category (required, enum of allowed categories), bookingId (optional UUID for booking-related issues)
- **DTO-002**: `TicketResponseDto` — id, ticketNumber, userId, category, priority, status, subject, description, assignedAdminId, createdAt, updatedAt
- **DTO-003**: `CreateTicketMessageDto` — message (required string)
- **DTO-004**: `TicketMessageResponseDto` — id, ticketId, senderId, message, createdAt
- **DTO-005**: `CreateDisputeDto` — bookingId (required UUID), title (required), description (required)
- **DTO-006**: `DisputeResponseDto` — id, bookingId, customerId, providerId, status, title, description, resolution, resolvedBy, resolvedAt, createdAt, updatedAt
- **DTO-007**: `CreateDisputeEvidenceDto` — file (binary upload, required)
- **DTO-008**: `DisputeEvidenceResponseDto` — id, disputeId, uploadedBy, fileUrl, fileType, uploadedAt
- **DTO-009**: `UpdateTicketStatusDto` — status (required enum of valid ticket statuses)
- **DTO-010**: `UpdateDisputeStatusDto` — status (required enum of valid dispute statuses)
- **DTO-011**: `ResolveDisputeDto` — resolution (required string describing outcome), resolvedInFavorOf (required enum: customer, provider)
- **DTO-012**: `TicketFilterDto` — status, category, priority, userId, dateFrom, dateTo, page, limit, sortBy, sortOrder, search (all optional)
- **DTO-013**: `DisputeFilterDto` — status, bookingId, dateFrom, dateTo, page, limit, sortBy, sortOrder (all optional)
- **SWAG-001**: All endpoints must include Swagger decorators with summary, description, request examples, response examples, error examples, and authentication requirements

### Measurable Outcomes

- **SC-001**: Customers and providers can create a support ticket in under 2 minutes from start to submission.
- **SC-002**: Dispute resolution is completed within 5 business days on average from the time the dispute is opened.
- **SC-003**: Users can view their ticket list and message history with results rendered within 2 seconds.
- **SC-004**: Administrators can change a ticket or dispute status with a single action and see the update reflected immediately.
- **SC-005**: Evidence file uploads of standard size (under 5 MB) complete within 5 seconds.
- **SC-006**: Users can successfully complete their primary task (create ticket, reply, view history) without errors on the first attempt 95% of the time.

## Assumptions

- The existing Authentication module handles JWT token issuance, validation, and provides the authenticated user context.
- The existing Users module provides role-based access (Customer, Provider, Admin) and user identity lookups.
- The existing Booking module provides booking existence validation and participant lookup (customer/provider for each booking).
- File storage uses an abstraction layer that supports Local Storage, AWS S3, Cloudflare R2, and Supabase Storage interchangeably.
- The existing Notifications module provides an event-driven pub/sub mechanism that can consume and dispatch notification events.
- Ticket numbering format is auto-generated as "TKT-" followed by a unique alphanumeric string (e.g., TKT-A3F8K2M1).
- Default ticket priority is "medium" when not explicitly assigned.
- Default dispute status on creation is "open".
- Only admins can change priority levels; customers and providers cannot self-escalate.
- Ticket assignment is manual — admins claim ownership by setting assignedAdminId.
- A booking can have at most one open dispute at any time; additional disputes require the existing one to be closed.
- Audit logs are stored in a dedicated immutable audit table with timestamp, actor, action type, entity type, entity ID, old value, and new value.
- The system uses UTC for all timestamps.
- All API endpoints require JWT authentication unless otherwise noted.
