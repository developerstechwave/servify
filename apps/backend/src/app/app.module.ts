import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule }          from '../module/auth/auth.module';
import { DashboardModule }     from '../module/dashboard/dashboard.module';
import { JoinRequestsModule }  from '../module/join-requests/join-requests.module';
import { OrganisationsModule } from '../module/organisations/organisations.module';
import { ProfileModule }       from '../module/profile/profile.module';
import { User }        from '../module/auth/entities/user.entity';
import { Invitation }  from '../module/auth/entities/invitation.entity';
import { JoinRequest } from '../module/join-requests/entities/join-request.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type:        'postgres',
      host:        process.env.DB_HOST     || 'localhost',
      port:        parseInt(process.env.DB_PORT || '5432'),
      username:    process.env.DB_USER     || 'postgres',
      password:    process.env.DB_PASSWORD || '',
      database:    process.env.DB_NAME     || 'servify',
      entities:    [User, Invitation, JoinRequest],
      synchronize: true,
      logging:     false,
    }),
    AuthModule,
    DashboardModule,
    JoinRequestsModule,
    OrganisationsModule,
    ProfileModule,
  ],
})
export class AppModule {}
