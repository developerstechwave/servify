import {
  Controller, Get, Post, Delete,
  Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomersService } from './customers.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('customers')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
export class CustomersController {
  constructor(private service: CustomersService) {}

  @Get()
  getAll(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('filter') filter?: string,
  ) {
    return this.service.getAll(req.user.organisationId, search, filter);
  }

  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) {
    return this.service.getOne(id, req.user.organisationId);
  }

  @Get(':id/subscriptions')
  getSubscriptions(@Req() req: any, @Param('id') id: string) {
    return this.service.getCustomerSubscriptions(id, req.user.organisationId);
  }

  @Get(':id/issues')
  getIssues(@Req() req: any, @Param('id') id: string) {
    return this.service.getCustomerIssues(id, req.user.organisationId);
  }

  @Post('invite')
  @Roles(UserRole.ADMIN)
  invite(
    @Req() req: any,
    @Body() body: { name: string; email: string; phone?: string },
  ) {
    return this.service.inviteCustomer(
      req.user.organisationId,
      body.name,
      body.email,
      body.phone,
    );
  }

  @Post(':id/reinvite')
  @Roles(UserRole.ADMIN)
  reinvite(@Req() req: any, @Param('id') id: string) {
    return this.service.reinviteCustomer(id, req.user.organisationId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.removeCustomer(id, req.user.organisationId);
  }
}
