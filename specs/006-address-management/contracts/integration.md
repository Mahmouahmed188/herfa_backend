# Booking Integration Contract: Address Management

**Date**: 2026-06-05 | **Input**: [index.md](index.md), [spec.md](../spec.md)

## Purpose

Define how the Bookings module can consume saved addresses from the Address Management module. The Booking entity already stores address as snapshot fields (`addressLine`, `city`, `latitude`, `longitude`) — this contract specifies the bridge between saved addresses and booking creation.

## Integration Points

### 1. Default Address Auto-Population

When a customer creates a booking without specifying an address:

1. Call `AddressesService.getDefaultAddress(customerId)` to retrieve the customer's default address
2. If a default exists, call `toAddressSnapshot(address)` to map it to booking snapshot fields
3. Populate the booking's `addressLine`, `city`, `latitude`, `longitude` fields
4. If no default exists, require the customer to select an address or enter one manually

### 2. Explicit Address Selection

When a customer selects a saved address during booking creation:

1. Accept an optional `addressId` parameter in the booking creation DTO
2. Call `AddressesService.getAddressById(addressId, customerId)` to retrieve the address
3. Call `toAddressSnapshot(address)` to map it to booking snapshot fields
4. Populate the booking's address snapshot fields
5. If `addressId` is provided but not found or doesn't belong to the customer, return a validation error

### 3. Address To Snapshot Mapping

Use the helper function in `src/modules/addresses/addresses.integration.ts`:

```typescript
import { toAddressSnapshot } from '../addresses/addresses.integration';

const snapshot = toAddressSnapshot(address);
// snapshot.addressLine = address.fullAddress
// snapshot.city = address.city
// snapshot.latitude = address.latitude
// snapshot.longitude = address.longitude
```

### 4. Immutability Guarantee

Once the booking is created, the snapshot fields are plain data columns — they are NOT linked to the Address table via foreign key. Future updates to the saved address will NOT affect historical booking records.

## Service Methods Available

| Method | Signature | Returns |
|--------|-----------|---------|
| `getDefaultAddress` | `(userId: string)` | `AddressResponseDto \| null` |
| `getAddressById` | `(id: string, userId: string)` | `AddressResponseDto \| null` |

Both methods are exposed via `AddressesService` which is exported from `AddressesModule`.

## Dependencies

- The Bookings module must import `AddressesModule` (or use `forwardRef` if circular)
- The Bookings service must inject `AddressesService`
- The booking creation DTO should add an optional `addressId?: string` field
- No schema changes to the Booking entity are required — snapshot fields already exist

## Future Considerations

- When Google Maps / OpenStreetMap integration is added, the `toAddressSnapshot` function can be extended to include additional geolocation metadata
- For provider tracking/nearby search, the coordinates from the snapshot can be used directly
