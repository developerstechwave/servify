import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { OrgRole } from './entities/role.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrgRole, User])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
