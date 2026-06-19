import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';
import { Issue, IssueStatus } from '../issues/entities/issue.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Issue)
    private issueRepo: Repository<Issue>,
  ) {}

  async getSuperAdminStats() {
    const [totalOrganisations, totalCustomers, totalEmployees] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.ADMIN } }),
      this.userRepo.count({ where: { role: UserRole.CUSTOMER } }),
      this.userRepo.count({ where: { role: UserRole.EMPLOYEE } }),
    ]);
    return {
      stats: {
        totalOrganisations: { value: totalOrganisations, change: +12.34 },
        totalCustomers:     { value: totalCustomers,     change: -12.34 },
        totalEmployees:     { value: totalEmployees,     change: -12.34 },
      },
      revenueAnalytics: this.generateMonthlyData(),
      customerActivity: this.generateMonthlyBarData(),
    };
  }

  async getAdminStats(organisationId: string) {
    const [verifiedCustomers, newCustomers, subAdmins, openTickets] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.CUSTOMER, organisationId, isActive: true } }),
      this.userRepo.count({ where: { role: UserRole.CUSTOMER, organisationId } }),
      this.userRepo.count({ where: { role: UserRole.EMPLOYEE, organisationId } }),
      this.issueRepo.count({ where: { organisationId, status: IssueStatus.PENDING } }),
    ]);
    return {
      stats: {
        verifiedCustomers: { value: verifiedCustomers, change: +12.34 },
        newCustomers:      { value: newCustomers,      change: -12.34 },
        openTickets:       { value: openTickets,       change: +12.34 },
        subAdmins:         { value: subAdmins,         change: +12.34 },
      },
      revenueAnalytics: this.generateRevenueData(),
      customerActivity: this.generateMonthlyBarData(),
      topLocations:     this.generateTopLocations(),
    };
  }

  async getEmployeeStats(employeeId: string, organisationId: string) {
    const [total, pending, inProgress, resolved] = await Promise.all([
      this.issueRepo.count({ where: { assigneeId: employeeId, organisationId } }),
      this.issueRepo.count({ where: { assigneeId: employeeId, organisationId, status: IssueStatus.PENDING } }),
      this.issueRepo.count({ where: { assigneeId: employeeId, organisationId, status: IssueStatus.IN_PROGRESS } }),
      this.issueRepo.count({ where: { assigneeId: employeeId, organisationId, status: IssueStatus.RESOLVED } }),
    ]);

    const recentTickets = await this.issueRepo.find({
      where: { assigneeId: employeeId, organisationId },
      order: { createdAt: 'DESC' },
      take:  5,
    });

    return {
      stats: {
        total:      { value: total,      label: 'Total Assigned'  },
        pending:    { value: pending,    label: 'Open Tickets'    },
        inProgress: { value: inProgress, label: 'In Progress'     },
        resolved:   { value: resolved,   label: 'Resolved'        },
      },
      recentTickets: recentTickets.map((i) => ({
        id:           i.id,
        topic:        i.topic,
        status:       i.status,
        customerName: i.customerName,
        serviceName:  i.serviceName,
        createdAt:    i.createdAt,
      })),
    };
  }

  private generateMonthlyData() {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months.map((month) => ({ month, value: Math.floor(Math.random() * 9000) + 1000 }));
  }

  private generateRevenueData() {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months.map((month) => ({
      month,
      success: Math.floor(Math.random() * 8000) + 2000,
      pending: Math.floor(Math.random() * 6000) + 1000,
      failed:  Math.floor(Math.random() * 3000) + 500,
    }));
  }

  private generateMonthlyBarData() {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months.map((month) => ({ month, value: Math.floor(Math.random() * 70000) + 5000 }));
  }

  private generateTopLocations() {
    return [
      { country: 'Ghana',        value: 38.6, color: 'rgba(101,16,127,1)'    },
      { country: 'Nigeria',      value: 22.5, color: 'rgba(101,16,127,0.6)'  },
      { country: 'Italy',        value: 30.8, color: 'rgba(101,16,127,0.35)' },
      { country: 'South Africa', value: 8.1,  color: 'rgba(101,16,127,0.15)' },
    ];
  }
}
