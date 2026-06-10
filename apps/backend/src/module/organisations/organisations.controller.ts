import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
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
  getAll(@Query('search') search?: string, @Query('status') status?: string) {
    return this.service.getAll(search, status);
  }

  @Post('invite')
  invite(@Body() body: { companyName: string; email: string; phone?: string }) {
    return this.service.inviteOrganisation(body.companyName, body.email, body.phone);
  }

  @Patch(':organisationId/activate')
  activate(@Param('organisationId') organisationId: string) {
    return this.service.setStatus(organisationId, true);
  }

  @Patch(':organisationId/deactivate')
  deactivate(@Param('organisationId') organisationId: string) {
    return this.service.setStatus(organisationId, false);
  }

  @Delete(':organisationId')
  delete(@Param('organisationId') organisationId: string) {
    return this.service.delete(organisationId);
  }
}
