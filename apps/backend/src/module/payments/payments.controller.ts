import {
  Controller, Get, Post, Patch,
  Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from './entities/payment.entity';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  // Customer subscribes / creates payment
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  create(@Req() req: any, @Body() dto: CreatePaymentDto) {
    return this.service.createPayment(
      req.user.id,
      req.user.organisationId,
      dto,
    );
  }

  // Admin gets all org payments
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAll(
    @Req() req: any,
    @Query('status') status?: PaymentStatus,
    @Query('search') search?: string,
  ) {
    return this.service.getAll(req.user.organisationId, status, search);
  }

  // Customer gets own payments
  @Get('my')
  getMyPayments(@Req() req: any) {
    return this.service.getMyPayments(req.user.id);
  }

  // Admin gets payment stats
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getStats(@Req() req: any) {
    return this.service.getStats(req.user.organisationId);
  }

  // Admin updates payment status
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { status: PaymentStatus },
  ) {
    return this.service.updateStatus(id, req.user.organisationId, body.status);
  }
}
