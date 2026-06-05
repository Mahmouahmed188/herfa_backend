import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../common/constants/user.enums';

export class RegisterUserDto {
  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'User phone number' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: 'Password123!', description: 'User password' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER, required: false })
  @IsEnum(UserRole)
  role?: UserRole;
}
