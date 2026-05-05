import { JobStatus } from '../../../common/constants/user.enums';
export declare class CreateJobDto {
    serviceId: string;
    title?: string;
    description?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    estimatedPrice?: number;
    scheduledDate?: string;
    scheduledTime?: string;
    images?: string[];
    notes?: string;
}
export declare class UpdateJobDto {
    title?: string;
    description?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    estimatedPrice?: number;
    notes?: string;
}
export declare class AcceptJobDto {
    assignmentId: string;
    quotedPrice?: number;
}
export declare class RejectJobDto {
    rejectionReason?: string;
}
export declare class JobQueryDto {
    page?: number;
    limit?: number;
    status?: JobStatus;
    startDate?: string;
    endDate?: string;
}
