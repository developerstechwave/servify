import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { User } from '../auth/entities/user.entity';
import { CustomerSubscription } from '../customer-subscriptions/entities/customer-subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, User, CustomerSubscription])],
  controllers: [PaymentsController],
  providers:   [PaymentsService],
  exports:     [PaymentsService],
})
export class PaymentsModule {}
