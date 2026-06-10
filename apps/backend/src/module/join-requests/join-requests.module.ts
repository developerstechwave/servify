import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinRequestsController } from './join-requests.controller';
import { JoinRequestsService } from './join-requests.service';
import { JoinRequest } from './entities/join-request.entity';
import { User } from '../auth/entities/user.entity';
import { Invitation } from '../auth/entities/invitation.entity';
import { MailModule } from '../../common/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JoinRequest, User, Invitation]),
    MailModule,
  ],
  controllers: [JoinRequestsController],
  providers:   [JoinRequestsService],
  exports:     [JoinRequestsService],
})
export class JoinRequestsModule {}
