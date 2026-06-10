import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('super-admin')
  @Roles(UserRole.SUPER_ADMIN)
  getSuperAdminDashboard() {
    return this.dashboardService.getSuperAdminStats();
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  getAdminDashboard(@Req() req: any) {
    return this.dashboardService.getAdminStats(req.user.organisationId);
  }
}
