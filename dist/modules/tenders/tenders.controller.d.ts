import { TendersService } from './tenders.service';
import { CreateTenderDto, UpdateTenderDto, CreateOfferDto } from './dto/tenders.dto';
export declare class TendersController {
    private readonly tendersService;
    constructor(tendersService: TendersService);
    createTender(user: any, dto: CreateTenderDto): Promise<import("../../entities/tender.entity").Tender>;
    getMyTenders(user: any): Promise<import("../../entities/tender.entity").Tender[]>;
    getOpenTenders(): Promise<import("../../entities/tender.entity").Tender[]>;
    getTender(id: string): Promise<import("../../entities/tender.entity").Tender>;
    updateTender(id: string, user: any, dto: UpdateTenderDto): Promise<import("../../entities/tender.entity").Tender>;
    cancelTender(id: string, user: any): Promise<import("../../entities/tender.entity").Tender>;
    createOffer(tenderId: string, user: any, dto: CreateOfferDto): Promise<import("../../entities/tender-offer.entity").TenderOffer>;
    getTenderOffers(tenderId: string): Promise<import("../../entities/tender-offer.entity").TenderOffer[]>;
    acceptOffer(offerId: string, user: any): Promise<import("../../entities/tender-offer.entity").TenderOffer>;
    rejectOffer(offerId: string, user: any): Promise<import("../../entities/tender-offer.entity").TenderOffer>;
}
