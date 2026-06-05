# Data Model: Notifications System

## Notification

Represents a single notification delivered to a user. Existing entity enhanced.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | Primary key (generated via uuid_generate_v4) |
| userId | VARCHAR | Yes | FK to User |
| type | ENUM | Yes | Booking, Review, Payment, Account, System |
| title | VARCHAR | Yes | Short notification title |
| message | TEXT | Yes | Notification body |
| relatedEntityType | VARCHAR | No | Booking, Review, Payment, etc. (new) |
| relatedEntityId | VARCHAR | No | UUID of the related entity (new) |
| actionUrl | VARCHAR | No | Existing — deep link URL |
| isRead | BOOLEAN | No | Default false |
| readAt | TIMESTAMP | No | When user marked as read |
| data | JSON | No | Existing — extra metadata |
| createdAt | TIMESTAMP | No | Auto-generated |

**Indexes**:
- `userId` + `createdAt` (existing — for sorted pagination)
- `userId` + `isRead` (existing — for unread count)
- `userId` + `type` (recommended — for type filtering)

**Relationships**: Many-to-One with User (userId)

## NotificationAnnouncement

Represents a system announcement created by an admin. New entity.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | Primary key |
| title | VARCHAR | Yes | Announcement title |
| message | TEXT | Yes | Announcement body |
| targetAudience | ENUM | Yes | all, customers, providers, individual |
| targetUserId | UUID | No | Required when targetAudience = individual |
| createdBy | VARCHAR | Yes | Admin userId who created it |
| createdAt | TIMESTAMP | No | Auto-generated |

**Indexes**:
- `createdBy` — for admin listing
- `createdAt` — for sorting

**Relationships**: Many-to-One with User (createdBy)

## Notification Channel Interface

Not a database entity. An abstract class (or interface) for future channel implementations.

| Method | Signature | Description |
|--------|-----------|-------------|
| send | `send(notification, user): Promise<void>` | Deliver notification via this channel |

**Implementations** (in-app only in v1):
- `InAppChannel` — saves to database (existing behavior)
- Future: `PushChannel`, `EmailChannel`, `SmsChannel`, `WebSocketChannel`

## Validation Rules

### Notification
- `userId` must reference an existing User
- `type` must be a valid NotificationType enum value
- `title` is required, max 255 chars
- `message` is required
- `userId` must match the authenticated user for read/access operations

### Announcement
- `title` is required, max 255 chars
- `message` is required
- `targetAudience` must be one of: all, customers, providers, individual
- `targetUserId` is required when targetAudience = individual
- `createdBy` is set from authenticated admin user

## State Transitions

### Notification lifecycle
```
Created (isRead=false) → Read (isRead=true) → [retained indefinitely]
```

### Read Status transitions
- Single notification: `unread → read` (idempotent)
- Bulk: `all unread → all read` (idempotent)
- No reverse transition (read → unread not supported)

## Announcement target audience logic

| targetAudience | Behavior |
|----------------|----------|
| all | Create notification for every active user |
| customers | Create notification for users with role=customer |
| providers | Create notification for users with role=provider |
| individual | Create notification for the specific targetUserId |
