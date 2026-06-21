import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceStatus } from '../entities/service.entity';

export class CreateServiceDto {
  @IsString()
  name: string;

  @Type(() => Number)
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

  @IsString()
  productId: string;
}
