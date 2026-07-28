import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../auth/entities/user.entity';
import { Issue } from '../issues/entities/issue.entity';
import { Payment } from '../payments/entities/payment.entity';
import { CustomerSubscription } from '../customer-subscriptions/entities/customer-subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Issue, Payment, CustomerSubscription])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
