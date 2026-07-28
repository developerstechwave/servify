import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerService } from './scheduler.service';
import { Issue } from '../issues/entities/issue.entity';
import { User } from '../auth/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Issue, User]),
    NotificationsModule,
  ],
  providers: [SchedulerService],
  exports:   [SchedulerService],
})
export class SchedulerModule {}
