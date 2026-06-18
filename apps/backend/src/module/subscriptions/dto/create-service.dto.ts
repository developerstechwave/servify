import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { ServiceStatus } from '../entities/service.entity';

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

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

  @IsUUID()
  productId: string;
}
