import { IsEmail, IsString, IsOptional } from 'class-validator';

export class OrganisationJoinDto {
  @IsString()
  companyName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  businessCertificate?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
