export declare class CreateTenderDto {
    serviceId: string;
    title: string;
    description: string;
    budgetMin?: number;
    budgetMax?: number;
    address?: string;
    deadline?: string;
    images?: string[];
}
export declare class UpdateTenderDto {
    title?: string;
    description?: string;
    status?: string;
}
export declare class CreateOfferDto {
    price: number;
    message?: string;
    estimatedDays?: number;
}
