import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerSubscriptionsController } from './customer-subscriptions.controller';
import { CustomerSubscriptionsService } from './customer-subscriptions.service';
import { CustomerSubscription } from './entities/customer-subscription.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Service } from '../subscriptions/entities/service.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerSubscription, Payment, Service, User])],
  controllers: [CustomerSubscriptionsController],
  providers:   [CustomerSubscriptionsService],
  exports:     [CustomerSubscriptionsService],
})
export class CustomerSubscriptionsModule {}
