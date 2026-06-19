import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomerSubscriptionsService } from './customer-subscriptions.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('customer-subscriptions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CustomerSubscriptionsController {
  constructor(private service: CustomerSubscriptionsService) {}

  @Get()
  getAll(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.service.getAll(req.user.id, search, status);
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.service.getStats(req.user.id);
  }

  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) {
    return this.service.getOne(id, req.user.id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateSubscriptionDto) {
    return this.service.create(req.user.id, req.user.organisationId, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: Partial<CreateSubscriptionDto>) {
    return this.service.update(id, req.user.id, dto);
  }

  @Patch(':id/unsubscribe')
  unsubscribe(@Req() req: any, @Param('id') id: string) {
    return this.service.unsubscribe(id, req.user.id);
  }

  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    return this.service.delete(id, req.user.id);
  }
}
