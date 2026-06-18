import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ServiceStatus } from '../entities/service.entity';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  vat?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  productId?: string;
}
