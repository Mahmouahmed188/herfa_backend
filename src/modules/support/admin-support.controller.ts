import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/user.enums';
import { TicketsService } from './services/tickets.service';
import { DisputesService } from './services/disputes.service';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { UpdateDisputeStatusDto } from './dto/update-dispute-status.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { TicketFilterDto } from './dto/ticket-filter.dto';
import { DisputeFilterDto } from './dto/dispute-filter.dto';
import {
  TicketResponseDto,
  PaginatedTicketResponseDto,
} from './dto/ticket-response.dto';
import {
  DisputeResponseDto,
  PaginatedDisputeResponseDto,
} from './dto/dispute-response.dto';

interface JwtUser {
  id: string;
  role: string;
}

@ApiTags('Admin - Support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/support')
export class AdminSupportController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly disputesService: DisputesService,
  ) {}

  @Get('tickets')
  @ApiOperation({
    summary: 'Get all support tickets',
    description:
      'Admin views all support tickets with full filtering, pagination, and sorting.',
  })
  @ApiResponse({
    status: 200,
    description: 'All tickets retrieved',
    type: PaginatedTicketResponseDto,
  })
  async findAllTickets(@Query() filter: TicketFilterDto) {
    const result = await this.ticketsService.findAllAdmin(filter);
    return {
      success: true,

      data: result.data,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      meta: result.meta,
    };
  }

  @Patch('tickets/:id/status')
  @ApiOperation({
    summary: 'Update ticket status',
    description:
      'Admin updates the status of a support ticket. Transitions must follow the valid state machine.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket status updated',
    type: TicketResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async updateTicketStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
    @CurrentUser() user: JwtUser,
  ) {
    const ticket = await this.ticketsService.updateStatus(
      id,
      dto.status,
      user.id,
      user.role,
    );
    return { success: true, data: ticket };
  }

  @Get('disputes')
  @ApiOperation({
    summary: 'Get all disputes',
    description: 'Admin views all disputes with filtering and pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'All disputes retrieved',
    type: PaginatedDisputeResponseDto,
  })
  async findAllDisputes(@Query() filter: DisputeFilterDto) {
    const result = await this.disputesService.findAllAdmin(filter);
    return {
      success: true,

      data: result.data,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      meta: result.meta,
    };
  }

  @Patch('disputes/:id/status')
  @ApiOperation({
    summary: 'Update dispute status',
    description:
      'Admin updates the status of a dispute. Transitions must follow the valid state machine.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dispute status updated',
    type: DisputeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async updateDisputeStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDisputeStatusDto,
    @CurrentUser() user: JwtUser,
  ) {
    const dispute = await this.disputesService.updateStatus(
      id,
      dto.status,
      user.id,
      user.role,
    );
    return { success: true, data: dispute };
  }

  @Patch('disputes/:id/resolve')
  @ApiOperation({
    summary: 'Resolve a dispute',
    description:
      'Admin resolves a dispute in favor of the customer or provider with resolution notes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dispute resolved',
    type: DisputeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dispute is not in a resolvable state',
  })
  async resolveDispute(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
    @CurrentUser() user: JwtUser,
  ) {
    const dispute = await this.disputesService.resolve(
      id,
      dto,
      user.id,
      user.role,
    );
    return { success: true, data: dispute };
  }
}
