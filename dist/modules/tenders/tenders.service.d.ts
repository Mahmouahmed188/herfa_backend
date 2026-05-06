import { Repository } from 'typeorm';
import { Tender } from '../../entities/tender.entity';
import { TenderOffer } from '../../entities/tender-offer.entity';
import { CreateTenderDto, UpdateTenderDto, CreateOfferDto } from './dto/tenders.dto';
export declare class TendersService {
    private tenderRepository;
    private offerRepository;
    constructor(tenderRepository: Repository<Tender>, offerRepository: Repository<TenderOffer>);
    createTender(userId: string, dto: CreateTenderDto): Promise<Tender>;
    findUserTenders(userId: string): Promise<Tender[]>;
    findAllOpen(): Promise<Tender[]>;
    findById(id: string): Promise<Tender>;
    updateTender(id: string, userId: string, dto: UpdateTenderDto): Promise<Tender>;
    cancelTender(id: string, userId: string): Promise<Tender>;
    createOffer(tenderId: string, providerId: string, dto: CreateOfferDto): Promise<TenderOffer>;
    getTenderOffers(tenderId: string): Promise<TenderOffer[]>;
    acceptOffer(offerId: string, userId: string): Promise<TenderOffer>;
    rejectOffer(offerId: string, userId: string): Promise<TenderOffer>;
}
