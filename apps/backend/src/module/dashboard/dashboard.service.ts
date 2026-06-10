import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getSuperAdminStats() {
    const [
      totalOrganisations,
      totalCustomers,
      totalEmployees,
    ] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.ADMIN } }),
      this.userRepo.count({ where: { role: UserRole.CUSTOMER } }),
      this.userRepo.count({ where: { role: UserRole.EMPLOYEE } }),
    ]);

    const revenueAnalytics = this.generateMonthlyData();
    const customerActivity = this.generateMonthlyBarData();

    return {
      stats: {
        totalOrganisations: { value: totalOrganisations, change: +12.34 },
        totalCustomers:     { value: totalCustomers,     change: -12.34 },
        totalEmployees:     { value: totalEmployees,     change: -12.34 },
      },
      revenueAnalytics,
      customerActivity,
    };
  }

  async getAdminStats(organisationId: string) {
    const [
      totalCustomers,
      totalEmployees,
    ] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.CUSTOMER, organisationId } }),
      this.userRepo.count({ where: { role: UserRole.EMPLOYEE, organisationId } }),
    ]);

    const revenueAnalytics = this.generateMonthlyData();
    const customerActivity = this.generateMonthlyBarData();

    return {
      stats: {
        totalCustomers: { value: totalCustomers, change: +8.5  },
        totalEmployees: { value: totalEmployees, change: +3.2  },
        openTickets:    { value: 0,              change: -5.1  },
      },
      revenueAnalytics,
      customerActivity,
    };
  }

  private generateMonthlyData() {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months.map((month) => ({
      month,
      value: Math.floor(Math.random() * 9000) + 1000,
    }));
  }

  private generateMonthlyBarData() {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months.map((month) => ({
      month,
      value: Math.floor(Math.random() * 70000) + 5000,
    }));
  }
}
