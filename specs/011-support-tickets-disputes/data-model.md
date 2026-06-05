# Data Model: Support Tickets & Disputes System

**Phase**: 1 | **Date**: 2026-06-05

## Entity: SupportTicket

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default: uuid_generate_v4() | |
| ticketNumber | varchar(20) | NOT NULL, UNIQUE | Auto-generated, format: TKT-XXXXXXXX |
| userId | uuid | NOT NULL, FK → users.id | Ticket creator (customer or provider) |
| category | enum | NOT NULL | Technical, Booking, Payment, Account, Verification, General |
| priority | enum | NOT NULL, DEFAULT 'medium' | low, medium, high, urgent |
| status | enum | NOT NULL, DEFAULT 'open' | open, in_progress, waiting_for_user, resolved, closed |
| subject | varchar(255) | NOT NULL | |
| description | text | NOT NULL | |
| assignedAdminId | uuid | NULL, FK → users.id | Admin handling the ticket |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

**Relationships**:
- `@ManyToOne` → User (userId) — ticket creator
- `@ManyToOne` → User (assignedAdminId) — assigned admin
- `@OneToMany` → TicketMessage (ticketId)

**Indexes**:
- `idx_support_tickets_userId` ON (userId)
- `idx_support_tickets_status` ON (status)
- `idx_support_tickets_category` ON (category)
- `idx_support_tickets_priority` ON (priority)
- `idx_support_tickets_assignedAdminId` ON (assignedAdminId)
- `idx_support_tickets_ticketNumber` ON (ticketNumber) — UNIQUE already covers lookup
- `idx_support_tickets_createdAt` ON (createdAt)

**Valid Status Transitions**:
- open → in_progress, resolved, closed
- in_progress → waiting_for_user, resolved, closed
- waiting_for_user → in_progress, resolved, closed
- resolved → closed
- closed → (terminal — no transitions)

---

## Entity: TicketMessage

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default: uuid_generate_v4() | |
| ticketId | uuid | NOT NULL, FK → support_tickets.id | |
| senderId | uuid | NOT NULL, FK → users.id | Can be customer, provider, or admin |
| message | text | NOT NULL | |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |

**Relationships**:
- `@ManyToOne` → SupportTicket (ticketId)
- `@ManyToOne` → User (senderId)

**Indexes**:
- `idx_ticket_messages_ticketId` ON (ticketId)
- `idx_ticket_messages_senderId` ON (senderId)
- `idx_ticket_messages_createdAt` ON (createdAt)

---

## Entity: Dispute

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default: uuid_generate_v4() | |
| bookingId | uuid | NOT NULL, FK → bookings.id | |
| customerId | uuid | NOT NULL, FK → users.id | Customer involved in booking |
| providerId | uuid | NOT NULL, FK → users.id | Provider involved in booking |
| status | enum | NOT NULL, DEFAULT 'open' | open, under_review, awaiting_evidence, resolved_customer, resolved_provider, closed |
| title | varchar(255) | NOT NULL | |
| description | text | NOT NULL | |
| resolution | text | NULL | Populated when resolved |
| resolvedBy | uuid | NULL, FK → users.id | Admin who resolved |
| resolvedAt | timestamp | NULL | |
| createdAt | timestamp | NOT NULL, DEFAULT now() | |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | |

**Relationships**:
- `@ManyToOne` → Booking (bookingId)
- `@ManyToOne` → User (customerId)
- `@ManyToOne` → User (providerId)
- `@ManyToOne` → User (resolvedBy)
- `@OneToMany` → DisputeEvidence (disputeId)

**Indexes**:
- `idx_disputes_bookingId` ON (bookingId)
- `idx_disputes_customerId` ON (customerId)
- `idx_disputes_providerId` ON (providerId)
- `idx_disputes_status` ON (status)
- `idx_disputes_createdAt` ON (createdAt)

**Valid Status Transitions**:
- open → under_review, closed
- under_review → awaiting_evidence, resolved_customer, resolved_provider, closed
- awaiting_evidence → under_review, closed
- resolved_customer → closed
- resolved_provider → closed
- closed → (terminal — no transitions)

---

## Entity: DisputeEvidence

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default: uuid_generate_v4() | |
| disputeId | uuid | NOT NULL, FK → disputes.id | |
| uploadedBy | uuid | NOT NULL, FK → users.id | |
| fileUrl | varchar(500) | NOT NULL | Storage path/URL |
| fileType | varchar(50) | NOT NULL | MIME type or extension |
| uploadedAt | timestamp | NOT NULL, DEFAULT now() | |

**Relationships**:
- `@ManyToOne` → Dispute (disputeId)
- `@ManyToOne` → User (uploadedBy)

**Indexes**:
- `idx_dispute_evidence_disputeId` ON (disputeId)
- `idx_dispute_evidence_uploadedBy` ON (uploadedBy)

**Allowed File Types**: jpg, jpeg, png, gif, webp, pdf, doc, docx
**Max File Sizes**: Images — 10 MB; Documents — 25 MB

---

## Entity Relationship Diagram

```
User (1) ──< SupportTicket (N)
User (1) ──< TicketMessage (N)
SupportTicket (1) ──< TicketMessage (N)
Booking (1) ──< Dispute (N)
User (1) ──< Dispute (customerId) (N)
User (1) ──< Dispute (providerId) (N)
User (1) ──< Dispute (resolvedBy) (N)
Dispute (1) ──< DisputeEvidence (N)
User (1) ──< DisputeEvidence (uploadedBy) (N)
```

## Constraints

1. A booking can have at most one open dispute at any time. (Application-level check before creation.)
2. Dispute participants (customerId, providerId) must match the booking's actual participants. (Validated via Booking module.)
3. Ticket status transitions must follow the defined DAG. (Validated server-side in service layer.)
4. Dispute status transitions must follow the defined DAG and are admin-only. (Validated server-side with role check.)
5. Only admins can assign/change ticket priority.
6. Evidence file types and sizes are validated before storage.
