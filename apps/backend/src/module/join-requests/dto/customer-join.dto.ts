import { IsEmail, IsString, IsUUID } from 'class-validator';

export class CustomerJoinDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsUUID()
  organisationId: string;
}
