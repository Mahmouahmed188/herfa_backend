import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/constants/user.enums';

export class UserProfileDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: '+1234567890' })
  phone: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  role: string;

  @ApiProperty({ example: true })
  isActive: boolean;
}
