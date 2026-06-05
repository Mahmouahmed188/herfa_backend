import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
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
import { BookingOwnershipGuard } from './guards/booking-ownership.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import {
  BookingResponseDto,
  PaginatedResponseDto,
} from './dto/booking-response.dto';
import { UserRole } from '../../common/constants/user.enums';

interface JwtUser {
  id: string;
  role: string;
  providerProfileId?: string;
}

@ApiTags('Bookings - Customer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new booking',
    description: 'Customer creates a booking for a service from a provider',
  })
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a customer' })
  async create(
    @Body() dto: CreateBookingDto,
    @CurrentUser('id') userId: string,
  ) {
    const booking = await this.bookingsService.create(dto, userId);
    return { success: true, data: booking };
  }

  @Get('my-bookings')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Get my bookings',
    description:
      'Customer views their booking history with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Bookings retrieved',
    type: PaginatedResponseDto,
  })
  async findMyBookings(
    @CurrentUser('id') userId: string,
    @Query() filter: BookingFilterDto,
  ) {
    const result = await this.bookingsService.findMyBookings(userId, filter);
    return { success: true, data: result };
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN)
  @UseGuards(BookingOwnershipGuard)
  @ApiOperation({
    summary: 'Get booking details',
    description: 'Retrieve full booking details with status history',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking details',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(@Param('id') id: string) {
    const booking = await this.bookingsService.findOne(id);
    return { success: true, data: booking };
  }

  @Patch(':id/cancel')
  @Roles(UserRole.CUSTOMER)
  @UseGuards(BookingOwnershipGuard)
  @ApiOperation({
    summary: 'Cancel booking',
    description: 'Customer cancels a pending booking',
  })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  @ApiResponse({
    status: 400,
    description: 'Invalid transition - booking not in pending status',
  })
  async cancelCustomer(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @CurrentUser('id') userId: string,
  ) {
    const booking = await this.bookingsService.cancel(id, userId, dto);
    return { success: true, data: booking };
  }
}

@ApiTags('Bookings - Provider')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ProviderBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('provider/bookings')
  @Roles(UserRole.PROVIDER)
  @ApiOperation({
    summary: 'Get assigned bookings',
    description: 'Provider views bookings assigned to them',
  })
  @ApiResponse({
    status: 200,
    description: 'Assigned bookings retrieved',
    type: PaginatedResponseDto,
  })
  async findProviderBookings(
    @CurrentUser() user: JwtUser,
    @Query() filter: BookingFilterDto,
  ) {
    const providerId = user.providerProfileId || user.id;
    const result = await this.bookingsService.findProviderBookings(
      providerId,
      filter,
    );
    return { success: true, data: result };
  }

  @Patch('bookings/:id/accept')
  @Roles(UserRole.PROVIDER)
  @UseGuards(BookingOwnershipGuard)
  @ApiOperation({
    summary: 'Accept booking',
    description: 'Provider accepts a pending booking',
  })
  @ApiResponse({ status: 200, description: 'Booking accepted' })
  async accept(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const booking = await this.bookingsService.accept(id, userId);
    return { success: true, data: booking };
  }

  @Patch('bookings/:id/reject')
  @Roles(UserRole.PROVIDER)
  @UseGuards(BookingOwnershipGuard)
  @ApiOperation({
    summary: 'Reject booking',
    description: 'Provider rejects a pending booking',
  })
  @ApiResponse({ status: 200, description: 'Booking rejected' })
  async reject(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @CurrentUser('id') userId: string,
  ) {
    const booking = await this.bookingsService.reject(id, userId, dto?.reason);
    return { success: true, data: booking };
  }

  @Patch('bookings/:id/on-the-way')
  @Roles(UserRole.PROVIDER)
  @UseGuards(BookingOwnershipGuard)
  @ApiOperation({
    summary: 'Mark on the way',
    description: 'Provider marks booking as on the way to customer',
  })
  @ApiResponse({ status: 200, description: 'Status updated to on_the_way' })
  async markOnTheWay(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const booking = await this.bookingsService.markOnTheWay(id, userId);
    return { success: true, data: booking };
  }

  @Patch('bookings/:id/start')
  @Roles(UserRole.PROVIDER)
  @UseGuards(BookingOwnershipGuard)
  @ApiOperation({
    summary: 'Mark in progress',
    description: 'Provider marks booking as work started',
  })
  @ApiResponse({ status: 200, description: 'Status updated to in_progress' })
  async markInProgress(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const booking = await this.bookingsService.markInProgress(id, userId);
    return { success: true, data: booking };
  }

  @Patch('bookings/:id/complete')
  @Roles(UserRole.PROVIDER)
  @UseGuards(BookingOwnershipGuard)
  @ApiOperation({
    summary: 'Mark completed',
    description: 'Provider marks booking as completed',
  })
  @ApiResponse({ status: 200, description: 'Booking completed with timestamp' })
  async markCompleted(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const booking = await this.bookingsService.markCompleted(id, userId);
    return { success: true, data: booking };
  }
}

@ApiTags('Bookings - Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/bookings')
export class AdminBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all bookings',
    description: 'Admin views all bookings with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'All bookings retrieved',
    type: PaginatedResponseDto,
  })
  async findAll(@Query() filter: BookingFilterDto) {
    const result = await this.bookingsService.findAll(filter);
    return { success: true, data: result };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get booking details (admin)',
    description: 'Admin views any booking details with full history',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking details',
    type: BookingResponseDto,
  })
  async findOne(@Param('id') id: string) {
    const booking = await this.bookingsService.findOne(id);
    return { success: true, data: booking };
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancel booking (admin)',
    description: 'Admin cancels any booking with mandatory reason',
  })
  @ApiResponse({ status: 200, description: 'Booking cancelled by admin' })
  async adminCancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('id') adminId: string,
  ) {
    if (!reason) {
      return {
        success: false,
        message: 'Cancellation reason is required for admin actions',
        errorCode: 'VALIDATION_ERROR',
      };
    }
    const booking = await this.bookingsService.adminCancel(id, adminId, reason);
    return { success: true, data: booking };
  }
}
