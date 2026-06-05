import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto, SortOrder } from '../../../common/dto/pagination.dto';

export enum AddressSortBy {
  CREATED_AT = 'createdAt',
  IS_DEFAULT = 'isDefault',
}

export class AddressFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(AddressSortBy)
  @ApiPropertyOptional({ enum: AddressSortBy, default: AddressSortBy.CREATED_AT })
  sortBy?: AddressSortBy = AddressSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  sortOrder?: SortOrder = SortOrder.DESC;
}
