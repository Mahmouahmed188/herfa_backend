import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../../../entities/address.entity';

@Injectable()
export class AddressOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const addressId = request.params.id;

    if (!addressId) {
      return true;
    }

    const address = await this.addressRepository.findOne({
      where: { id: addressId },
    });
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (user.role === 'admin' || user.role === 'super_admin') {
      request.address = address;
      return true;
    }

    if (address.userId !== user.id) {
      throw new ForbiddenException('You can only manage your own addresses');
    }

    request.address = address;
    return true;
  }
}
