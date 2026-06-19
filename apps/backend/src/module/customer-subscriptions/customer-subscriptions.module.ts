import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerSubscriptionsController } from './customer-subscriptions.controller';
import { CustomerSubscriptionsService } from './customer-subscriptions.service';
import { CustomerSubscription } from './entities/customer-subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerSubscription])],
  controllers: [CustomerSubscriptionsController],
  providers: [CustomerSubscriptionsService],
  exports: [CustomerSubscriptionsService],
})
export class CustomerSubscriptionsModule {}
