import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesService } from './roles.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('roles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class RolesController {
  constructor(private service: RolesService) {}

  @Get()
  getAll(@Req() req: any, @Query('search') search?: string) {
    return this.service.getAll(req.user.organisationId, req.user.id, search);
  }

  @Post()
  create(@Req() req: any, @Body() body: { roles: string[] }) {
    return this.service.createRoles(
      req.user.organisationId,
      `${req.user.firstName} ${req.user.lastName}`,
      body.roles,
    );
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: { name: string }) {
    return this.service.updateRole(id, req.user.organisationId, body.name);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteRole(id, req.user.organisationId);
  }
}
