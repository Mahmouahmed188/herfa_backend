"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderVerificationStatus = exports.ProviderApplicationStatus = exports.ApplicationStatus = exports.ReviewType = exports.NotificationType = exports.PaymentStatus = exports.JobAssignmentStatus = exports.JobStatus = exports.UserStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "customer";
    UserRole["PROVIDER"] = "provider";
    UserRole["ADMIN"] = "admin";
    UserRole["SUPER_ADMIN"] = "super_admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["PENDING"] = "pending";
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["DELETED"] = "deleted";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["PENDING"] = "pending";
    JobStatus["ASSIGNED"] = "assigned";
    JobStatus["IN_PROGRESS"] = "in_progress";
    JobStatus["COMPLETED"] = "completed";
    JobStatus["CANCELLED"] = "cancelled";
    JobStatus["EXPIRED"] = "expired";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
var JobAssignmentStatus;
(function (JobAssignmentStatus) {
    JobAssignmentStatus["PENDING"] = "pending";
    JobAssignmentStatus["ACCEPTED"] = "accepted";
    JobAssignmentStatus["REJECTED"] = "rejected";
    JobAssignmentStatus["EXPIRED"] = "expired";
})(JobAssignmentStatus || (exports.JobAssignmentStatus = JobAssignmentStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PROCESSING"] = "processing";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["JOB_CREATED"] = "job_created";
    NotificationType["JOB_ASSIGNED"] = "job_assigned";
    NotificationType["JOB_STATUS_UPDATED"] = "job_status_updated";
    NotificationType["JOB_COMPLETED"] = "job_completed";
    NotificationType["JOB_CANCELLED"] = "job_cancelled";
    NotificationType["REVIEW_RECEIVED"] = "review_received";
    NotificationType["PAYMENT_RECEIVED"] = "payment_received";
    NotificationType["PAYMENT_FAILED"] = "payment_failed";
    NotificationType["PROVIDER_APPLICATION"] = "provider_application";
    NotificationType["SYSTEM"] = "system";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var ReviewType;
(function (ReviewType) {
    ReviewType["CUSTOMER_TO_PROVIDER"] = "customer_to_provider";
    ReviewType["PROVIDER_TO_CUSTOMER"] = "provider_to_customer";
})(ReviewType || (exports.ReviewType = ReviewType = {}));
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["PENDING"] = "pending";
    ApplicationStatus["APPROVED"] = "approved";
    ApplicationStatus["REJECTED"] = "rejected";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
var ProviderApplicationStatus;
(function (ProviderApplicationStatus) {
    ProviderApplicationStatus["PENDING"] = "pending";
    ProviderApplicationStatus["UNDER_REVIEW"] = "under_review";
    ProviderApplicationStatus["APPROVED"] = "approved";
    ProviderApplicationStatus["REJECTED"] = "rejected";
})(ProviderApplicationStatus || (exports.ProviderApplicationStatus = ProviderApplicationStatus = {}));
var ProviderVerificationStatus;
(function (ProviderVerificationStatus) {
    ProviderVerificationStatus["PENDING"] = "pending";
    ProviderVerificationStatus["SUBMITTED"] = "submitted";
    ProviderVerificationStatus["VERIFIED"] = "verified";
    ProviderVerificationStatus["REJECTED"] = "rejected";
})(ProviderVerificationStatus || (exports.ProviderVerificationStatus = ProviderVerificationStatus = {}));
//# sourceMappingURL=user.enums.js.map