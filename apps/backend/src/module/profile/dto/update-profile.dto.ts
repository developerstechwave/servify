import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString()  firstName?: string;
  @IsOptional() @IsString()  lastName?: string;
  @IsOptional() @IsEmail()   email?: string;
  @IsOptional() @IsString()  phone?: string;
  @IsOptional() @IsString()  country?: string;
  @IsOptional() @IsString()  region?: string;
  @IsOptional() @IsString()  address?: string;
  @IsOptional() @IsString()  description?: string;
  @IsOptional() @IsString()  idType?: string;
  @IsOptional() @IsString()  idNumber?: string;
  @IsOptional() @IsString()  plans?: string;
  @IsOptional() @IsString()  dedicatedLine?: string;
  @IsOptional() @IsString()  postcode?: string;
  @IsOptional() @IsString()  billingType?: string;
}
