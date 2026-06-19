import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { SubscriptionStatus } from '../entities/customer-subscription.entity';

export class CreateSubscriptionDto {
  @IsUUID()
  productId: string;

  @IsString()
  productName: string;

  @IsUUID()
  serviceId: string;

  @IsString()
  serviceName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  billingType?: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
