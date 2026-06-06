import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/user.enums';
import { TicketOwnershipGuard } from './guards/ticket-ownership.guard';
import { DisputeParticipantGuard } from './guards/dispute-participant.guard';
import { TicketsService } from './services/tickets.service';
import { TicketMessagesService } from './services/ticket-messages.service';
import { DisputesService } from './services/disputes.service';
import { DisputeEvidenceService } from './services/dispute-evidence.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { TicketFilterDto } from './dto/ticket-filter.dto';
import { DisputeFilterDto } from './dto/dispute-filter.dto';
import {
  TicketResponseDto,
  PaginatedTicketResponseDto,
} from './dto/ticket-response.dto';
import { TicketMessageResponseDto } from './dto/ticket-message-response.dto';
import {
  DisputeResponseDto,
  PaginatedDisputeResponseDto,
} from './dto/dispute-response.dto';
import { DisputeEvidenceResponseDto } from './dto/dispute-evidence-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Support Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('support')
export class SupportController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly ticketMessagesService: TicketMessagesService,
    private readonly disputesService: DisputesService,
    private readonly disputeEvidenceService: DisputeEvidenceService,
  ) {}

  @Post('tickets')
  @Roles(UserRole.CUSTOMER, UserRole.PROVIDER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a support ticket',
    description:
      'Customer or provider creates a new support ticket with category, subject, and description.',
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    type: TicketResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createTicket(
    @Body() dto: CreateTicketDto,
    @CurrentUser('id') userId: string,
  ) {
    const ticket = await this.ticketsService.create(userId, dto);
    return { success: true, data: ticket };
  }

  @Get('tickets')
  @Roles(UserRole.CUSTOMER, UserRole.PROVIDER)
  @ApiOperation({
    summary: 'List my support tickets',
    description:
      'Get all support tickets for the authenticated user with filtering and pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tickets retrieved',
    type: PaginatedTicketResponseDto,
  })
  async findMyTickets(
    @CurrentUser('id') userId: string,
    @Query() filter: TicketFilterDto,
  ) {
    const result = await this.ticketsService.findAll(userId, filter);
    return {
      success: true,

      data: result.data,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      meta: result.meta,
    };
  }

  @Get('tickets/:id')
  @Roles(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN)
  @UseGuards(TicketOwnershipGuard)
  @ApiOperation({
    summary: 'Get ticket details',
    description: 'Retrieve full ticket details including message history.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket details',
    type: TicketResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async findTicket(@Param('id') id: string) {
    const ticket = await this.ticketsService.findById(id);
    return { success: true, data: ticket };
  }

  @Post('tickets/:id/messages')
  @Roles(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN)
  @UseGuards(TicketOwnershipGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add message to ticket',
    description:
      'Add a message to an existing support ticket. Only allowed on open, in_progress, or waiting_for_user tickets.',
  })
  @ApiResponse({
    status: 201,
    description: 'Message added',
    type: TicketMessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Ticket is resolved or closed' })
  async addMessage(
    @Param('id') ticketId: string,
    @Body() dto: CreateTicketMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    const message = await this.ticketMessagesService.create(
      ticketId,
      userId,
      dto.message,
    );
    return { success: true, data: message };
  }

  @Post('disputes')
  @Roles(UserRole.CUSTOMER, UserRole.PROVIDER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a dispute',
    description: 'Customer or provider opens a dispute against a booking.',
  })
  @ApiResponse({
    status: 201,
    description: 'Dispute created',
    type: DisputeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or dispute already exists',
  })
  async createDispute(
    @Body() dto: CreateDisputeDto,
    @CurrentUser('id') userId: string,
  ) {
    const dispute = await this.disputesService.create(userId, dto);
    return { success: true, data: dispute };
  }

  @Get('disputes')
  @Roles(UserRole.CUSTOMER, UserRole.PROVIDER)
  @ApiOperation({
    summary: 'List my disputes',
    description:
      'Get all disputes for the authenticated user with filtering and pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Disputes retrieved',
    type: PaginatedDisputeResponseDto,
  })
  async findMyDisputes(
    @CurrentUser('id') userId: string,
    @Query() filter: DisputeFilterDto,
  ) {
    const result = await this.disputesService.findAll(userId, filter);
    return {
      success: true,

      data: result.data,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      meta: result.meta,
    };
  }

  @Get('disputes/:id')
  @Roles(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN)
  @UseGuards(DisputeParticipantGuard)
  @ApiOperation({
    summary: 'Get dispute details',
    description:
      'Retrieve full dispute details including evidence attachments.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dispute details',
    type: DisputeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async findDispute(@Param('id') id: string) {
    const dispute = await this.disputesService.findById(id);
    return { success: true, data: dispute };
  }

  @Post('disputes/:id/evidence')
  @Roles(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN)
  @UseGuards(DisputeParticipantGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/evidence',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload dispute evidence',
    description:
      'Upload evidence file (images or documents) to support a dispute.',
  })
  @ApiResponse({
    status: 201,
    description: 'Evidence uploaded',
    type: DisputeEvidenceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async uploadEvidence(
    @Param('id') disputeId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) {
      return {
        success: false,
        message: 'File is required',
        errorCode: 'VALIDATION_ERROR',
      };
    }

    const fileUrl = `/uploads/evidence/${file.filename}`;
    const evidence = await this.disputeEvidenceService.create(
      disputeId,
      userId,
      file,
      fileUrl,
    );
    return { success: true, data: evidence };
  }
}
