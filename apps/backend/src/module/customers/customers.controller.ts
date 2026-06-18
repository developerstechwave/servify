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
@Roles(UserRole.ADMIN)
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

  @Post('invite')
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
  reinvite(@Req() req: any, @Param('id') id: string) {
    return this.service.reinviteCustomer(id, req.user.organisationId);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.removeCustomer(id, req.user.organisationId);
  }
}
