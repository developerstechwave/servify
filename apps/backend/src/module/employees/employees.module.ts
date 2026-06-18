import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { User } from '../auth/entities/user.entity';
import { MailModule } from '../../common/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MailModule,
  ],
  controllers: [EmployeesController],
  providers:   [EmployeesService],
  exports:     [EmployeesService],
})
export class EmployeesModule {}
