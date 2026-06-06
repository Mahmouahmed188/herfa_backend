import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ClassifyServiceRequestDto {
  @ApiProperty({
    description: 'Description of the maintenance problem',
    example: 'The bathroom sink is leaking and water is pooling on the floor',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description: string;
}
