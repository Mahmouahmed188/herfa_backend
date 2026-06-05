import { Address } from '../../entities/address.entity';

export interface AddressSnapshot {
  addressLine: string;
  city: string;
  latitude: number;
  longitude: number;
}

export function toAddressSnapshot(address: Address): AddressSnapshot {
  return {
    addressLine: address.fullAddress,
    city: address.city,
    latitude: address.latitude,
    longitude: address.longitude,
  };
}
