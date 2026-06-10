import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from './organisations.service';
import { User } from '../auth/entities/user.entity';
import { Invitation } from '../auth/entities/invitation.entity';
import { MailModule } from '../../common/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Invitation]),
    MailModule,
  ],
  controllers: [OrganisationsController],
  providers:   [OrganisationsService],
  exports:     [OrganisationsService],
})
export class OrganisationsModule {}
