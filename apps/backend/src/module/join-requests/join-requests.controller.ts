import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JoinRequestsService } from './join-requests.service';
import { CustomerJoinDto } from './dto/customer-join.dto';
import { OrganisationJoinDto } from './dto/organisation-join.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JoinRequestType } from './entities/join-request.entity';

@Controller('join-requests')
export class JoinRequestsController {
  constructor(private service: JoinRequestsService) {}

  @Get('organisations')
  getOrganisations() {
    return this.service.getOrganisations();
  }

  @Post('customer')
  customerJoin(@Body() dto: CustomerJoinDto) {
    return this.service.customerJoinRequest(dto);
  }

  @Post('organisation')
  organisationJoin(@Body() dto: OrganisationJoinDto) {
    return this.service.organisationJoinRequest(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getPending(@Query('type') type?: JoinRequestType) {
    return this.service.getPendingRequests(type);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getOne(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Patch(':id/approve-organisation')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  approveOrganisation(@Param('id') id: string) {
    return this.service.approveOrganisationRequest(id);
  }

  @Patch(':id/approve-customer')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  approveCustomer(@Param('id') id: string, @Req() req: any) {
    return this.service.approveCustomerRequest(id, req.user.organisationId);
  }

  @Patch(':id/reject')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  reject(@Param('id') id: string) {
    return this.service.rejectRequest(id);
  }
}
