export interface NotificationPayload {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  actionUrl?: string;
  data?: Record<string, unknown>;
  createdAt: Date;
}

export interface UserContext {
  id: string;
  email: string;
  role: string;
}

export interface NotificationChannel {
  readonly name: string;
  send(notification: NotificationPayload, user: UserContext): Promise<void>;
}
