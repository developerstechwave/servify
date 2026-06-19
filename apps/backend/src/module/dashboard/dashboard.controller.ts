import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get('super-admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  getSuperAdminStats() {
    return this.service.getSuperAdminStats();
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminStats(@Req() req: any) {
    return this.service.getAdminStats(req.user.organisationId);
  }

  @Get('employee')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  getEmployeeStats(@Req() req: any) {
    return this.service.getEmployeeStats(req.user.id, req.user.organisationId);
  }
}
