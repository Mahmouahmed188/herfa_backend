import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfile } from '../../entities/customer-profile.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerProfile)
    private customerProfileRepository: Repository<CustomerProfile>,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.customerProfileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!profile) throw new NotFoundException('Customer profile not found');
    return profile;
  }

  async updateProfile(userId: string, data: Partial<CustomerProfile>) {
    const profile = await this.customerProfileRepository.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Customer profile not found');
    Object.assign(profile, data);
    return this.customerProfileRepository.save(profile);
  }

  async setDefaultLocation(userId: string, latitude: number, longitude: number, address: string) {
    const profile = await this.customerProfileRepository.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Customer profile not found');
    profile.defaultLatitude = latitude;
    profile.defaultLongitude = longitude;
    profile.defaultAddress = address;
    return this.customerProfileRepository.save(profile);
  }
}