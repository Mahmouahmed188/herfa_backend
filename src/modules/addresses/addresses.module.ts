import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressesController } from './addresses.controller';
import { AdminAddressesController } from './admin-addresses.controller';
import { AddressesService } from './addresses.service';
import { Address } from '../../entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address])],
  controllers: [AddressesController, AdminAddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
