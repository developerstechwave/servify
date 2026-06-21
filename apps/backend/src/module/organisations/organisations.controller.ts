import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrganisationsService } from './organisations.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('organisations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class OrganisationsController {
  constructor(private service: OrganisationsService) {}

  @Get()
  getAll(@Query('search') search?: string) {
    return this.service.getAll(search);
  }

  @Post('invite')
  invite(@Body() body: { name: string; email: string }) {
    return this.service.inviteOrganisation(body.email, body.name);
  }

  @Patch(':organisationId/activate')
  activate(@Param('organisationId') organisationId: string) {
    return this.service.activate(organisationId);
  }

  @Patch(':organisationId/deactivate')
  deactivate(@Param('organisationId') organisationId: string) {
    return this.service.deactivate(organisationId);
  }

  @Delete(':organisationId')
  delete(@Param('organisationId') organisationId: string) {
    return this.service.delete(organisationId);
  }
}
