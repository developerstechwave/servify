import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsString()
  serviceId: string;

  @IsString()
  serviceName: string;

  @IsString()
  productName: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  vat?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
