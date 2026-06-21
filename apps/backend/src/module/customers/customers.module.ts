import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { User } from '../auth/entities/user.entity';
import { Invitation } from '../auth/entities/invitation.entity';
import { CustomerSubscription } from '../customer-subscriptions/entities/customer-subscription.entity';
import { Issue } from '../issues/entities/issue.entity';
import { MailModule } from '../../common/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Invitation, CustomerSubscription, Issue]),
    MailModule,
  ],
  controllers: [CustomersController],
  providers:   [CustomersService],
  exports:     [CustomersService],
})
export class CustomersModule {}
