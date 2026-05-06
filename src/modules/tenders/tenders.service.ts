import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tender, TenderStatus } from '../../entities/tender.entity';
import { TenderOffer, OfferStatus } from '../../entities/tender-offer.entity';
import { CreateTenderDto, UpdateTenderDto, CreateOfferDto } from './dto/tenders.dto';

@Injectable()
export class TendersService {
  constructor(
    @InjectRepository(Tender)
    private tenderRepository: Repository<Tender>,
    @InjectRepository(TenderOffer)
    private offerRepository: Repository<TenderOffer>,
  ) {}

  async createTender(userId: string, dto: CreateTenderDto): Promise<Tender> {
    const tender = this.tenderRepository.create({
      userId,
      serviceId: dto.serviceId,
      title: dto.title,
      description: dto.description,
      budgetMin: dto.budgetMin,
      budgetMax: dto.budgetMax,
      address: dto.address,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      images: dto.images,
      status: TenderStatus.OPEN,
    });
    return this.tenderRepository.save(tender);
  }

  async findUserTenders(userId: string): Promise<Tender[]> {
    return this.tenderRepository.find({
      where: { userId },
      relations: ['service', 'service.category', 'offers'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllOpen(): Promise<Tender[]> {
    return this.tenderRepository.find({
      where: { status: TenderStatus.OPEN },
      relations: ['service', 'service.category', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Tender> {
    const tender = await this.tenderRepository.findOne({
      where: { id },
      relations: [
        'service',
        'service.category',
        'user',
        'offers',
        'offers.provider',
      ],
    });
    if (!tender) throw new NotFoundException('Tender not found');
    return tender;
  }

  async updateTender(id: string, userId: string, dto: UpdateTenderDto): Promise<Tender> {
    const tender = await this.tenderRepository.findOne({ where: { id } });
    if (!tender) throw new NotFoundException('Tender not found');
    if (tender.userId !== userId) throw new ForbiddenException('You can only update your own tenders');

    Object.assign(tender, dto);
    return this.tenderRepository.save(tender);
  }

  async cancelTender(id: string, userId: string): Promise<Tender> {
    const tender = await this.tenderRepository.findOne({ where: { id } });
    if (!tender) throw new NotFoundException('Tender not found');
    if (tender.userId !== userId) throw new ForbiddenException('Not your tender');
    if (tender.status !== TenderStatus.OPEN) throw new BadRequestException('Can only cancel open tenders');

    tender.status = TenderStatus.CANCELLED;
    return this.tenderRepository.save(tender);
  }

  // --- OFFERS ---

  async createOffer(tenderId: string, providerId: string, dto: CreateOfferDto): Promise<TenderOffer> {
    const tender = await this.tenderRepository.findOne({ where: { id: tenderId } });
    if (!tender) throw new NotFoundException('Tender not found');
    if (tender.status !== TenderStatus.OPEN) throw new BadRequestException('This tender is not accepting offers');

    // Check if provider already submitted an offer
    const existing = await this.offerRepository.findOne({ where: { tenderId, providerId } });
    if (existing) throw new BadRequestException('You have already submitted an offer for this tender');

    const offer = this.offerRepository.create({
      tenderId,
      providerId,
      price: dto.price,
      message: dto.message,
      estimatedDays: dto.estimatedDays,
      status: OfferStatus.PENDING,
    });
    return this.offerRepository.save(offer);
  }

  async getTenderOffers(tenderId: string): Promise<TenderOffer[]> {
    return this.offerRepository.find({
      where: { tenderId },
      relations: ['provider'],
      order: { price: 'ASC' },
    });
  }

  async acceptOffer(offerId: string, userId: string): Promise<TenderOffer> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: ['tender'],
    });
    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.tender.userId !== userId) throw new ForbiddenException('Not authorized');
    if (offer.tender.status !== TenderStatus.OPEN) throw new BadRequestException('Tender is no longer open');

    // Accept this offer
    offer.status = OfferStatus.ACCEPTED;
    await this.offerRepository.save(offer);

    // Reject all other offers and close the tender
    await this.offerRepository
      .createQueryBuilder()
      .update(TenderOffer)
      .set({ status: OfferStatus.REJECTED })
      .where('tenderId = :tenderId AND id != :offerId', { tenderId: offer.tenderId, offerId })
      .execute();

    await this.tenderRepository.update(offer.tenderId, {
      status: TenderStatus.COMPLETED,
      acceptedOfferId: offerId,
    });

    return offer;
  }

  async rejectOffer(offerId: string, userId: string): Promise<TenderOffer> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: ['tender'],
    });
    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.tender.userId !== userId) throw new ForbiddenException('Not authorized');

    offer.status = OfferStatus.REJECTED;
    return this.offerRepository.save(offer);
  }
}
