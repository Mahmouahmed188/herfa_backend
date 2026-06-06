# Integration Notes: Support Tickets & Disputes System

**Date**: 2026-06-06

## Module Dependencies

| Module | Import | Usage |
|--------|--------|-------|
| AuthModule | JWT guard & roles | All endpoints require authentication; role-based access (Customer, Provider, Admin) |
| TypeOrmModule | Entity repositories | SupportTicket, TicketMessage, Dispute, DisputeEvidence, AuditLog |
| EventEmitterModule | @nestjs/event-emitter | Event-driven notification integration |
| UploadsModule | File upload handling | Evidence file uploads via multipart/form-data |

## Guard Requirements

| Guard | Endpoints | Rule |
|-------|-----------|------|
| `JwtAuthGuard` | All | Valid JWT token required |
| `RolesGuard` | All | Role-based access via `@Roles()` decorator |
| `TicketOwnershipGuard` | `GET /support/tickets/:id`, `POST /support/tickets/:id/messages` | User must own ticket OR be admin |
| `DisputeParticipantGuard` | `GET /support/disputes/:id`, `POST /support/disputes/:id/evidence` | User must be customer/provider of dispute OR admin |

## Event Contracts (Notification Integration)

Events emitted via `EventEmitter2`:

| Event | Payload | Triggered By |
|-------|---------|-------------|
| `ticket.created` | `{ ticketId, ticketNumber, userId, category }` | TicketsService.create() |
| `ticket.updated` | `{ ticketId, oldStatus, newStatus }` | TicketsService.updateStatus() |
| `ticket.message_added` | `{ ticketId, messageId, senderId }` | TicketMessagesService.create() |
| `ticket.closed` | `{ ticketId }` | TicketsService.updateStatus() when status=closed |
| `dispute.opened` | `{ disputeId, bookingId, userId }` | DisputesService.create() |
| `dispute.resolved` | `{ disputeId, bookingId, resolvedInFavorOf }` | DisputesService.resolve() |

## Handler Registration

Handler: `src/modules/notifications/handlers/support-events.handler.ts`

Registered in `NotificationsModule` as `SupportEventsHandler`. Follows existing pattern:
- `@OnEvent('event.name')` decorator
- Delegates to `NotificationsService.create()`
- Uses `NotificationType` enum values prefixed with support entity names

## Entity Migration

Run the following command to generate the migration after entities are created:

```bash
npm run migration:generate -- src/migrations/CreateSupportTicketsDisputes
```

Expected tables:
- `support_tickets`
- `ticket_messages`
- `disputes`
- `dispute_evidence`

## Audit Log Events

Audit entries logged via `AuditService`:

| Action | Entity Type | Metadata |
|--------|-------------|----------|
| `ticket.status_changed` | SupportTicket | `{ oldStatus, newStatus }` |
| `ticket.priority_changed` | SupportTicket | `{ oldPriority, newPriority }` |
| `dispute.status_changed` | Dispute | `{ oldStatus, newStatus }` |
| `dispute.resolved` | Dispute | `{ oldStatus, newStatus, resolution, resolvedInFavorOf }` |
| `dispute.evidence_uploaded` | DisputeEvidence | `{ fileType, fileUrl, disputeId }` |

## File Storage

Evidence files are stored at `./uploads/evidence/` using multer disk storage. URL format: `/uploads/evidence/{randomName}.{ext}`. File validation is performed in `DisputeEvidenceService`:
- Allowed types: jpg, jpeg, png, gif, webp, pdf, doc, docx
- Image max size: 10 MB
- Document max size: 25 MB
