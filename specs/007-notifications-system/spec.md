# Feature Specification: Notifications System

**Feature Branch**: `007-notifications-system`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "Notifications System Specification"

## User Scenarios & Testing

### User Story 1 - View and Manage Personal Notifications (Priority: P1)

A customer or provider can view their own in-app notifications, see how many are unread, mark individual notifications as read, and mark all as read in one action.

**Why this priority**: This is the core functionality of the notifications system — without it, users cannot see or act on their notifications.

**Independent Test**: A test user with pre-existing notifications can log in, retrieve their notification list, verify the unread count, mark one as read, and confirm the count updates. This can be tested with a single authenticated user and does not depend on any other module or event.

**Acceptance Scenarios**:

1. **Given** a user has 5 unread notifications, **When** they request their notification list, **Then** they receive a paginated list sorted by date (most recent first) with each notification showing title, message, type, timestamp, and read status.
2. **Given** a user has unread notifications, **When** they request the unread count, **Then** they receive a single number representing the count of notifications where isRead is false.
3. **Given** a user views an unread notification, **When** they mark that notification as read, **Then** the notification's read status changes to read and the unread count decreases by one.
4. **Given** a user has multiple unread notifications, **When** they mark all as read, **Then** all their notifications become read and the unread count becomes zero.

---

### User Story 2 - Automatic Notification Generation from Platform Events (Priority: P1)

The system automatically generates notifications for users when relevant events occur—such as booking status changes, reviews, payments, and account actions.

**Why this priority**: Without automatic generation, the notification center would be empty. This story delivers the value of keeping users informed without manual effort. Events from all dependent modules (bookings, reviews, payments, accounts) are covered here as a single integrated capability.

**Independent Test**: A test event payload (e.g., "BookingAccepted for user X") is published to the event system. Verify that a notification with the correct title, message, type, and related entity reference is created for the intended user. This can be tested in isolation using simulated event messages.

**Acceptance Scenarios**:

1. **Given** a booking request is accepted, **When** the booking module emits a BookingAccepted event, **Then** a notification of type "Booking" is created for the customer with title "Booking Accepted" and message "Your booking has been accepted by the provider."
2. **Given** a new review is submitted for a provider, **When** the reviews module emits a NewReview event, **Then** a notification of type "Review" is created for the provider.
3. **Given** a payment is successfully processed, **When** the payment module emits a PaymentReceived event, **Then** a notification of type "Payment" is created for the relevant user.
4. **Given** a user's account is suspended by an admin, **When** the account system emits an AccountSuspended event, **Then** a notification of type "Account" is created for that user.
5. **Given** a booking is cancelled, **When** the booking module emits a BookingCancelled event, **Then** notifications are created for both the customer and the provider.

---

### User Story 3 - Admin Announcements (Priority: P2)

Admins can send announcements to targeted audiences (all users, all customers, all providers, or individual users). Announcements appear in recipients' notification centers.

**Why this priority**: Announcements enable platform-wide communication but are less critical than personal notifications and event-triggered notifications. This is valuable for operational messaging but not part of the core user experience.

**Independent Test**: An admin creates an announcement targeting "all providers." Verify that a notification of type "System" is created for every provider account, with the announcement title and message. Verify that customers do not receive this announcement.

**Acceptance Scenarios**:

1. **Given** an admin is authenticated, **When** they create an announcement with a title, message, and target audience, **Then** the announcement is stored and notifications are created for all users in the target audience.
2. **Given** an announcement has been created, **When** an admin views the list of announcements, **Then** they see all announcements with their title, message, target audience, and creation date.
3. **Given** an announcement exists, **When** an admin deletes it, **Then** the announcement is removed. The associated notifications in users' inboxes remain (users have already received them).
4. **Given** an admin attempts to create an announcement without a title or message, **Then** the system rejects the request with a validation error.

---

### User Story 4 - Notification Filtering and Search (Priority: P3)

Users can filter their notifications by type, read status, and date range to quickly find relevant information.

**Why this priority**: Search and filtering improve usability but are not essential for the initial launch. Users can still view and act on notifications without this capability.

**Independent Test**: A user with notifications of different types and read statuses applies each filter individually and in combination, verifying the returned list matches the filter criteria.

**Acceptance Scenarios**:

1. **Given** a user has notifications of multiple types (Booking, Payment, Account), **When** they filter by type "Booking", **Then** only Booking-type notifications are returned.
2. **Given** a user has both read and unread notifications, **When** they filter by read status "unread", **Then** only unread notifications are returned.
3. **Given** a user has notifications across multiple days, **When** they specify a date range, **Then** only notifications within that range are returned.
4. **Given** a user applies multiple filters simultaneously (e.g., type=Booking AND isRead=false), **When** they request filtered notifications, **Then** the results match all applied criteria.

### Edge Cases

- What happens when an event is emitted for a non-existent user? The system should silently skip notification creation for deleted or invalid user references.
- What happens when a single event should notify multiple users (e.g., booking cancelled affects both customer and provider)? The system creates separate notifications for each affected user.
- What happens when a user has thousands of notifications? Pagination ensures the response remains small and fast; the user can page through results.
- What happens when an admin target audience string is invalid? The system rejects the announcement creation with a clear validation error.
- What happens when a user marks another user's notification as read? The system returns a forbidden/unauthorized error.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST generate a notification when a booking event occurs (created, accepted, rejected, provider on the way, service started, service completed, cancelled).
- **FR-002**: The system MUST generate a notification when a review is submitted for a user.
- **FR-003**: The system MUST generate a notification when a payment event occurs (received, failed, refund processed).
- **FR-004**: The system MUST generate a notification when an account event occurs (verified, suspended).
- **FR-005**: Users MUST be able to view their own paginated list of notifications, sorted by creation date descending.
- **FR-006**: Users MUST be able to view their unread notification count.
- **FR-007**: Users MUST be able to mark a single notification as read.
- **FR-008**: Users MUST be able to mark all their notifications as read in a single action.
- **FR-009**: Users MUST NOT be able to view, mark, or modify another user's notifications.
- **FR-010**: Admins MUST be able to create announcements targeting all users, all customers, all providers, or individual users.
- **FR-011**: Admins MUST be able to view a list of all past announcements.
- **FR-012**: Admins MUST be able to delete an announcement.
- **FR-013**: Announcements MUST require a title and message; creation without these MUST be rejected.
- **FR-014**: When an admin creates an announcement, the system MUST create a notification for each targeted user.
- **FR-015**: Users MUST be able to filter notifications by type, read status, and date range.
- **FR-016**: The system MUST support pagination for notification retrieval with a configurable page size.
- **FR-017**: The system MUST be designed with an extensible notification channel interface so that future delivery channels (push, email, SMS, WebSocket) can be added without modifying existing notification generation logic.
- **FR-018**: The system MUST use an event-driven architecture where notifications are triggered by events rather than direct calls from business logic modules.

### Key Entities

- **Notification**: Represents a single notification delivered to a user. Contains title, message, type (Booking/Review/Payment/Account/System), read status, a reference to the related entity (type + ID), and a timestamp. Each notification belongs to exactly one user.
- **Announcement**: Represents a system announcement created by an admin. Contains title, message, target audience (all users / all customers / all providers / individual user), creator reference, and timestamp. An announcement generates notifications for the targeted audience.
- **Notification Channel**: An abstraction representing a delivery mechanism (in-app, push, email, SMS). Initially only in-app is implemented, but the interface allows adding new channels without changing core notification logic.

## API Contract & DTOs

- **DTO-001**: NotificationResponse — id, userId, title, message, type, relatedEntityType, relatedEntityId, isRead, createdAt
- **DTO-002**: NotificationListResponse — items (array of NotificationResponse), totalCount, unreadCount, page, pageSize
- **DTO-003**: UnreadCountResponse — unreadCount (number)
- **DTO-004**: CreateAnnouncementRequest — title (required), message (required), targetAudience (required), optional targetUserId (required when targetAudience is "individual")
- **DTO-005**: AnnouncementResponse — id, title, message, targetAudience, createdBy, createdAt
- **DTO-006**: AnnouncementListResponse — items (array of AnnouncementResponse), totalCount
- **SWAG-001**: Swagger documentation for all endpoints with request/response examples, error examples (401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Validation Error), and bearer token authentication requirement.

### Measurable Outcomes

- **SC-001**: Users can view their notification list and see the unread count in under 1 second under normal load.
- **SC-002**: The system generates notifications from event emissions within 5 seconds of the event occurring.
- **SC-003**: Users can mark notifications as read in a single action with immediate confirmation.
- **SC-004**: Admins can broadcast an announcement to all platform users, and all targeted users receive the notification within 30 seconds.
- **SC-005**: Users can only ever see their own notifications; no user can access another user's notification data through any endpoint.
- **SC-006**: The system handles up to 1 million notifications without performance degradation for end-user retrieval queries.

## Assumptions

- Users authenticate via JWT and roles (customer, provider, admin) are already established by the Authentication Module.
- The Booking Management, Reviews, Payment, and Account modules already have event emission capabilities that the notification system can subscribe to.
- Notification data is retained indefinitely unless a future data retention policy is introduced. Users do not have a "delete notification" capability in v1.
- Duplicate event emissions within a short time window (e.g., same event ID within 5 minutes) are treated as idempotent — only one notification is created per unique event.
- Announcement deletion removes the announcement record but does not delete notifications already delivered to users.
- The default pagination page size is 20 notifications per page.
- The notification type is determined by the event source (booking events → "Booking" type, payment events → "Payment" type, etc.).
- System announcements are stored as "System" type notifications in users' notification lists.
