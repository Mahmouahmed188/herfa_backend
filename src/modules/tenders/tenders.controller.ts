import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TendersService } from './tenders.service';
import { CreateTenderDto, UpdateTenderDto, CreateOfferDto } from './dto/tenders.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tenders')
@Controller('tenders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  // --- TENDERS ---

  @Post()
  @ApiOperation({ summary: 'Create a tender/service request' })
  async createTender(@CurrentUser() user: any, @Body() dto: CreateTenderDto) {
    return this.tendersService.createTender(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user tenders' })
  async getMyTenders(@CurrentUser() user: any) {
    return this.tendersService.findUserTenders(user.id);
  }

  @Get('open')
  @ApiOperation({ summary: 'Get all open tenders (for providers)' })
  async getOpenTenders() {
    return this.tendersService.findAllOpen();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tender by ID' })
  async getTender(@Param('id') id: string) {
    return this.tendersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tender' })
  async updateTender(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateTenderDto,
  ) {
    return this.tendersService.updateTender(id, user.id, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a tender' })
  async cancelTender(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tendersService.cancelTender(id, user.id);
  }

  // --- OFFERS ---

  @Post(':id/offers')
  @ApiOperation({ summary: 'Submit an offer on a tender' })
  async createOffer(
    @Param('id') tenderId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateOfferDto,
  ) {
    return this.tendersService.createOffer(tenderId, user.id, dto);
  }

  @Get(':id/offers')
  @ApiOperation({ summary: 'Get all offers for a tender' })
  async getTenderOffers(@Param('id') tenderId: string) {
    return this.tendersService.getTenderOffers(tenderId);
  }

  @Patch('offers/:offerId/accept')
  @ApiOperation({ summary: 'Accept an offer' })
  async acceptOffer(@Param('offerId') offerId: string, @CurrentUser() user: any) {
    return this.tendersService.acceptOffer(offerId, user.id);
  }

  @Patch('offers/:offerId/reject')
  @ApiOperation({ summary: 'Reject an offer' })
  async rejectOffer(@Param('offerId') offerId: string, @CurrentUser() user: any) {
    return this.tendersService.rejectOffer(offerId, user.id);
  }
}
