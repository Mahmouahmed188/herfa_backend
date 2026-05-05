export declare enum UserRole {
    CUSTOMER = "customer",
    PROVIDER = "provider",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin"
}
export declare enum UserStatus {
    PENDING = "pending",
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    DELETED = "deleted"
}
export declare enum JobStatus {
    PENDING = "pending",
    ASSIGNED = "assigned",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    EXPIRED = "expired"
}
export declare enum JobAssignmentStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    EXPIRED = "expired"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare enum NotificationType {
    JOB_CREATED = "job_created",
    JOB_ASSIGNED = "job_assigned",
    JOB_STATUS_UPDATED = "job_status_updated",
    JOB_COMPLETED = "job_completed",
    JOB_CANCELLED = "job_cancelled",
    REVIEW_RECEIVED = "review_received",
    PAYMENT_RECEIVED = "payment_received",
    PAYMENT_FAILED = "payment_failed",
    PROVIDER_APPLICATION = "provider_application",
    SYSTEM = "system"
}
export declare enum ReviewType {
    CUSTOMER_TO_PROVIDER = "customer_to_provider",
    PROVIDER_TO_CUSTOMER = "provider_to_customer"
}
export declare enum ApplicationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare enum ProviderApplicationStatus {
    PENDING = "pending",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare enum ProviderVerificationStatus {
    PENDING = "pending",
    SUBMITTED = "submitted",
    VERIFIED = "verified",
    REJECTED = "rejected"
}
