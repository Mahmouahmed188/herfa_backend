export class TrackingStartedEvent {
  sessionId: string;
  bookingId: string;
  providerId: string;
  customerId: string;
}

export class TrackingPausedEvent {
  sessionId: string;
  bookingId: string;
  providerId: string;
  customerId: string;
}

export class TrackingResumedEvent {
  sessionId: string;
  bookingId: string;
  providerId: string;
  customerId: string;
}

export class TrackingCompletedEvent {
  sessionId: string;
  bookingId: string;
  providerId: string;
  customerId: string;
}

export class TrackingArrivedNearbyEvent {
  sessionId: string;
  bookingId: string;
  providerId: string;
  customerId: string;
}

export class TrackingArrivedEvent {
  sessionId: string;
  bookingId: string;
  providerId: string;
  customerId: string;
}
