/**
 * Notification channel interface for extensible delivery.
 * Implement this interface to add new delivery channels
 * (push, email, SMS, WebSocket) without modifying core notification logic.
 *
 * @contract NotificationChannel
 * @version 1.0.0
 */
export interface NotificationChannel {
  /**
   * Unique channel identifier.
   */
  readonly name: string;

  /**
   * Deliver a notification to a user via this channel.
   *
   * @param notification - The notification payload to deliver
   * @param user - The target user with delivery preferences
   */
  send(notification: NotificationPayload, user: UserContext): Promise<void>;
}

/**
 * Payload delivered to notification channels.
 * Contains all information needed to render and deliver the notification.
 */
export interface NotificationPayload {
  id: string;
  userId: string;
  type: 'Booking' | 'Review' | 'Payment' | 'Account' | 'System';
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  actionUrl?: string;
  data?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Minimal user context for channel delivery decisions.
 */
export interface UserContext {
  id: string;
  email: string;
  role: 'customer' | 'provider' | 'admin';
  fcmToken?: string;
  phone?: string;
}
