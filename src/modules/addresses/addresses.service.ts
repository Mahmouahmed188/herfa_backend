import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Address } from '../../entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressFilterDto, AddressSortBy } from './dto/address-filter.dto';
import { AdminAddressFilterDto } from './dto/admin-address-filter.dto';
import { AddressResponseDto } from './dto/address-response.dto';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);

  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateAddressDto): Promise<AddressResponseDto> {
    this.logger.log(`Creating address for user ${userId}`);

    const address = this.addressRepository.create({
      ...dto,
      userId,
      isDefault: false,
    });

    const saved = await this.addressRepository.save(address);
    this.logger.log(`Address created: ${saved.id}`);
    return saved;
  }

  async findAllByUser(userId: string, filter: AddressFilterDto): Promise<{ data: AddressResponseDto[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const sortOrder = filter.sortOrder || 'DESC' as any;

    const query = this.addressRepository
      .createQueryBuilder('address')
      .where('address.userId = :userId', { userId });

    if (filter.sortBy === AddressSortBy.IS_DEFAULT) {
      query.orderBy('address.isDefault', 'DESC').addOrderBy('address.createdAt', sortOrder);
    } else {
      query.orderBy('address.createdAt', sortOrder);
    }

    const total = await query.getCount();
    const addresses = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: addresses,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string): Promise<AddressResponseDto> {
    const address = await this.addressRepository.findOne({ where: { id } });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    if (address.userId !== userId) {
      throw new ForbiddenException('You can only access your own addresses');
    }
    return address;
  }

  async update(id: string, userId: string, dto: UpdateAddressDto): Promise<AddressResponseDto> {
    const address = await this.addressRepository.findOne({ where: { id } });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    if (address.userId !== userId) {
      throw new ForbiddenException('You can only update your own addresses');
    }

    Object.assign(address, dto);
    const saved = await this.addressRepository.save(address);
    this.logger.log(`Address updated: ${saved.id}`);
    return saved;
  }

  async delete(id: string, userId: string): Promise<void> {
    const address = await this.addressRepository.findOne({ where: { id } });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    if (address.userId !== userId) {
      throw new ForbiddenException('You can only delete your own addresses');
    }

    await this.addressRepository.remove(address);
    this.logger.log(`Address deleted: ${id}`);
  }

  async setDefault(id: string, userId: string): Promise<AddressResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const address = await queryRunner.manager.findOne(Address, { where: { id } });
      if (!address) {
        throw new NotFoundException('Address not found');
      }
      if (address.userId !== userId) {
        throw new ForbiddenException('You can only set default on your own addresses');
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Address)
        .set({ isDefault: false })
        .where('userId = :userId', { userId })
        .andWhere('isDefault = :isDefault', { isDefault: true })
        .execute();

      address.isDefault = true;
      const saved = await queryRunner.manager.save(address);

      await queryRunner.commitTransaction();
      this.logger.log(`Default address set: ${saved.id}`);
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getDefaultAddress(userId: string): Promise<AddressResponseDto | null> {
    const address = await this.addressRepository.findOne({
      where: { userId, isDefault: true },
    });
    return address || null;
  }

  async getAddressById(id: string, userId: string): Promise<AddressResponseDto | null> {
    const address = await this.addressRepository.findOne({
      where: { id, userId },
    });
    return address || null;
  }

  async adminFindAll(filter: AdminAddressFilterDto): Promise<{ data: AddressResponseDto[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const sortOrder = filter.sortOrder || 'DESC' as any;

    const query = this.addressRepository
      .createQueryBuilder('address')
      .where('address.userId = :userId', { userId: filter.userId })
      .orderBy('address.createdAt', sortOrder);

    const total = await query.getCount();
    const addresses = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: addresses,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async adminFindOne(id: string): Promise<AddressResponseDto> {
    const address = await this.addressRepository.findOne({ where: { id } });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }
}
