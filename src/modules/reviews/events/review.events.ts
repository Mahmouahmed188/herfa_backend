export interface ReviewEventData {
  reviewId: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment?: string;
}

export interface ReviewEventPayload {
  event: string;
  timestamp: string;
  data: ReviewEventData;
  reason?: string;
}
