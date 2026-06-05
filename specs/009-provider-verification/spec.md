# Feature Specification: Provider Verification System

**Feature Branch**: `009-provider-verification`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "Design and implement the Provider Verification System for the Herfa Backend. This module manages the onboarding, verification, approval, rejection, and suspension of service providers..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Provider submits verification request (Priority: P1)

A registered provider with a completed profile uploads their identity and professional documents, then submits a verification request to become an approved service provider on the platform.

**Why this priority**: This is the core entry point of the verification workflow. Without it, no provider can become verified and the system serves no purpose.

**Independent Test**: A provider with a complete profile can upload a document, submit a verification request, and see their status change from "pending" to "under_review". This can be tested end-to-end with a single provider account.

**Acceptance Scenarios**:

1. **Given** a provider with a complete profile, **When** they upload a required identity document and submit their verification, **Then** the system creates a verification record with status "under_review" and notifies the provider of successful submission.
2. **Given** a provider who has not uploaded the required documents, **When** they attempt to submit verification, **Then** the system rejects the submission with a message indicating which documents are missing.
3. **Given** a provider who is already under review, **When** they attempt to resubmit, **Then** the system notifies them that their application is already being processed.

---

### User Story 2 - Admin reviews and decides on verification (Priority: P1)

An admin reviews submitted provider applications, examines uploaded documents, and either approves or rejects the verification with appropriate reasoning.

**Why this priority**: Admin review is the gatekeeper that ensures only verified providers reach customers. Without this, no provider can be approved and the marketplace cannot function.

**Independent Test**: An admin can view a list of pending verification requests, open a specific application, view its documents, approve it, and confirm the provider's status changes to "approved". This can be tested independently with one admin and one provider accounts.

**Acceptance Scenarios**:

1. **Given** an admin viewing the verification queue, **When** they select a pending application and approve it, **Then** the provider status changes to "approved", the admin action is logged, and the provider receives an approval notification.
2. **Given** an admin reviewing a provider's documents, **When** they find the documents unsatisfactory and reject the application with a reason, **Then** the provider status changes to "rejected", the rejection reason is recorded, the provider is notified with the reason, and the provider can resubmit.
3. **Given** an admin attempting to approve their own provider profile, **When** they try to approve their own verification, **Then** the system prevents self-approval.

---

### User Story 3 - Provider views verification status and history (Priority: P2)

A provider checks the current status of their verification request and views the history of all actions taken on their application.

**Why this priority**: Providers need visibility into where their application stands and what actions have been taken. This is important for transparency but is a read-only flow.

**Independent Test**: A provider can view their current verification status and see a chronological history of all status changes with timestamps and notes. This can be tested with a single provider account that has gone through at least one status change.

**Acceptance Scenarios**:

1. **Given** a provider who has submitted verification, **When** they check their status, **Then** they see the current status ("under_review", "approved", "rejected", or "suspended") along with the submission date.
2. **Given** a provider whose verification was rejected, **When** they view their application details, **Then** they see the rejection reason provided by the admin.
3. **Given** a provider viewing their verification history, **When** they request the audit trail, **Then** they see a chronological, immutable list of all status changes with timestamps.

---

### User Story 4 - Admin suspends and reactivates providers (Priority: P2)

An admin temporarily suspends a verified provider who is violating platform policies, and later reactivates them once the issue is resolved.

**Why this priority**: Suspension and reactivation are essential for ongoing platform trust and safety, but are secondary to the core verification workflow.

**Independent Test**: An admin can suspend an approved provider with a reason, verify the provider disappears from search results, and later reactivate them. This can be tested with one admin and one approved provider account.

**Acceptance Scenarios**:

1. **Given** an approved provider, **When** an admin suspends them with a suspension reason, **Then** the provider status changes to "suspended", the provider is notified with the reason, and the provider no longer appears in customer search results.
2. **Given** a suspended provider, **When** an admin reactivates them, **Then** the provider status changes back to "approved", the provider is notified, and they reappear in search results.
3. **Given** an admin, **When** they attempt to suspend a provider without a reason, **Then** the system requires a suspension reason before proceeding.

---

### User Story 5 - Provider manages verification documents (Priority: P3)

A provider uploads, views, and deletes documents associated with their verification application before submission.

**Why this priority**: Document management is preparatory work for the verification submission. It is important but can function as a supporting flow rather than an independent feature slice.

**Independent Test**: A provider can upload a document of an accepted type, view all their uploaded documents, and delete a specific document. This can be tested independently with a single provider account.

**Acceptance Scenarios**:

1. **Given** a provider preparing their verification, **When** they upload a valid document file, **Then** the document is stored and associated with their verification record.
2. **Given** a provider with uploaded documents, **When** they delete a document, **Then** the document is removed from their verification record.
3. **Given** a provider who has already submitted their verification, **When** they attempt to delete a document, **Then** the system prevents document deletion while the application is under review.

---

### Edge Cases

- What happens when a provider uploads an invalid file type or a file that exceeds the maximum size limit? The system should reject the upload with a clear error message.
- What happens when a provider who is already approved submits another verification request? The system should prevent duplicate submissions and notify the provider they are already verified.
- What happens when a suspended provider attempts to submit a new verification? The system should inform them their account is suspended and they should contact support.
- What happens when a rejected provider resubmits with new documents? The system should create a new verification cycle, resetting the status to "under_review."
- What happens when an admin tries to delete a verification record? The system should prevent deletion — verification records are immutable for audit purposes.
- What happens when document storage service is unavailable during upload? The system should fail gracefully with a message to try again later.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow providers with a complete profile to upload verification documents of supported types (identity documents, professional licenses, commercial registrations).
- **FR-002**: System MUST require providers to upload at least one identity document (National ID or Passport) before submitting a verification request.
- **FR-003**: System MUST allow providers to submit a verification request only after all required documents are uploaded.
- **FR-004**: System MUST prevent providers from approving their own verification requests.
- **FR-005**: System MUST allow authorized admins to view all pending verification applications with associated documents.
- **FR-006**: System MUST allow authorized admins to approve a provider's verification, changing status from "under_review" to "approved".
- **FR-007**: System MUST require a rejection reason when an admin rejects a provider's verification; status changes from "under_review" to "rejected".
- **FR-008**: System MUST allow a rejected provider to resubmit their verification with updated documents, resetting the status to "under_review".
- **FR-009**: System MUST require a suspension reason when an admin suspends a provider; status changes from "approved" to "suspended".
- **FR-010**: System MUST allow an admin to reactivate a suspended provider, restoring status to "approved".
- **FR-011**: System MUST allow providers to view their current verification status and submission date at any time.
- **FR-012**: System MUST allow providers to view the reason for rejection or suspension when applicable.
- **FR-013**: System MUST maintain an immutable audit trail of all status changes including old status, new status, who performed the action, timestamp, and notes.
- **FR-014**: System MUST only include providers with "approved" status in public search results and provider listings.
- **FR-015**: System MUST exclude providers with "rejected" or "suspended" status from public search results and provider listings.
- **FR-016**: System MUST allow filtering of verification applications by status, submission date range, provider name, and provider category.
- **FR-017**: System MUST support paginated and sorted listing of verification applications for admin review.
- **FR-018**: System MUST send a notification to the provider when their verification status changes (submitted, approved, rejected, suspended, reactivated).
- **FR-019**: System MUST validate that uploaded files are of accepted document formats (PDF, JPEG, PNG) and within size limits.
- **FR-020**: System MUST prevent modification or deletion of documents once verification is under review.
- **FR-021**: System MUST enforce that only a provider can access their own verification data; an admin can access all verification data.
- **FR-022**: System MUST log all verification-related actions (document upload, submission, approval, rejection, suspension, reactivation) in the audit system.

### Key Entities *(include if feature involves data)*

- **Provider Verification**: A record representing a provider's verification application. Has a one-to-one relationship with a Provider. Status transitions through a defined lifecycle (pending -> under_review -> approved | rejected -> suspended -> reactivated). Contains the current status, rejection/suspension reason, submission and review timestamps.
- **Verification Document**: A file uploaded by a provider as part of their verification. Belongs to a single Provider Verification. Each document has a type (National ID, Passport, Driver License, Professional License, Commercial Registration), a storage URL, and an upload timestamp.
- **Verification History**: An immutable chronological record of all status changes on a Provider Verification. Contains old and new status values, who performed the change, any notes, and the timestamp. Append-only.
- **Provider (external entity)**: The user who is seeking verification. Already exists as part of the Users and Provider Profiles modules.
- **Admin (external entity)**: The administrative user who reviews and acts on verification applications. Already exists as part of the Admin module.

## API Contract & DTOs *(mandatory)*

- **DTO-001 - Submit Verification Request**: Provider submits their verification. Input includes implicit association with the authenticated provider's profile. System validates that required documents are uploaded. Response includes the new verification ID and status ("under_review").
- **DTO-002 - Upload Document**: Provider uploads a document file. Input includes the file and document type. Response includes document ID, type, and storage URL.
- **DTO-003 - Delete Document**: Provider deletes an uploaded document by ID. Only allowed when verification is still in "pending" status. Response confirms deletion.
- **DTO-004 - Verification Status Response**: Returns current verification status, submission date, review date, reviewer name, and rejection/suspension reason if applicable.
- **DTO-005 - Verification Documents List**: Returns list of uploaded documents with their types, storage URLs, and upload dates.
- **DTO-006 - Admin Verification List**: Paginated, sorted list of all verification applications with filtering by status, date range, provider name, and category.
- **DTO-007 - Admin Verification Detail**: Full details of a single verification including provider info, documents, and history.
- **DTO-008 - Approve/Reject/Suspend/Reactivate Actions**: Admin action inputs include the verification ID and a reason (required for reject and suspend, optional for approve and reactivate).
- **DTO-009 - Verification History Response**: Returns chronological list of status changes with old status, new status, changed by, notes, and timestamp.
- **SWAG-001**: All endpoints require JWT authentication documentation. Provider endpoints scoped to own data only. Admin endpoints require admin role documentation. Error responses include standard format with message, status code, and timestamp.

### Measurable Outcomes

- **SC-001**: Providers can complete the document upload and verification submission process in under 5 minutes.
- **SC-002**: Admin review and decision (approve or reject) can be completed in under 2 minutes per application.
- **SC-003**: System supports up to 10,000 concurrent verification applications without degradation in performance.
- **SC-004**: 100% of verification status changes result in an immutable audit record that can be retrieved on demand.
- **SC-005**: 100% of provider status changes trigger a corresponding notification to the provider within 1 minute.
- **SC-006**: Providers can verify their application status within 2 seconds of their request at any time.
- **SC-007**: Only approved providers appear in public search results — zero instances of unapproved providers being visible to customers.

## Assumptions

- Providers must have a completed profile before initiating verification. The Provider Profiles module is assumed to be operational.
- The Authentication and Authorization modules (JWT, role-based access) are already in place.
- Required identity documents: at least one of National ID or Passport must be uploaded. Professional License is recommended but not required for all provider types. Commercial Registration is optional.
- Maximum file size for document uploads is 10 MB per file. Accepted formats include PDF, JPEG, and PNG.
- Document storage will use an abstraction layer allowing different providers (local storage for development, cloud storage for production).
- The notification system is already operational and can accept events for provider verification status changes.
- The audit logging system is already operational and can accept log entries.
- Admins are pre-existing users with appropriate admin roles assigned.
- Verification status transitions follow a defined state machine: pending -> under_review -> approved | rejected -> suspended -> approved (reactivation). No direct transitions between non-adjacent states are allowed.
- Providers are notified asynchronously — the notification delivery mechanism is handled by the existing Notifications module and is assumed to be reliable.
- Search and listing visibility changes take effect immediately upon status change (eventual consistency is acceptable within a few seconds).
- The "category" filter refers to the provider's service category as defined in the Provider Profiles module.
