# Event Contracts

Follows the `EventEmitter2` pattern established in `BookingsService`.

## Event Names

| Event | Emitted When | Payload |
|-------|-------------|---------|
| `review.created` | Customer creates a review | `{ event, timestamp, data }` |
| `review.updated` | Customer edits their review | `{ event, timestamp, data }` |
| `review.removed` | Admin removes a review or customer deletes it | `{ event, timestamp, data, reason }` |

## Event Payload Structure

```typescript
interface ReviewEventPayload {
  event: string;          // e.g., 'review.created'
  timestamp: string;      // ISO 8601
  data: {
    reviewId: string;
    bookingId: string;
    customerId: string;
    providerId: string;
    rating: number;
    comment?: string;
  };
  reason?: string;        // Only for 'review.removed' — admin reason or 'customer_deleted'
}
```

## Emit Helper Pattern

```typescript
private emitReviewEvent(eventName: string, review: Review, extra?: Record<string, unknown>): void {
  this.eventEmitter.emit(`review.${eventName}`, {
    event: `review.${eventName}`,
    timestamp: new Date().toISOString(),
    data: {
      reviewId: review.id,
      bookingId: review.bookingId,
      customerId: review.customerId,
      providerId: review.providerId,
      rating: review.rating,
      comment: review.comment,
      ...extra,
    },
  });
}
```
