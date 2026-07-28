import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';
import { Issue, IssueStatus } from '../issues/entities/issue.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { CustomerSubscription } from '../customer-subscriptions/entities/customer-subscription.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Issue)
    private issueRepo: Repository<Issue>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(CustomerSubscription)
    private subRepo: Repository<CustomerSubscription>,
  ) {}

  async getSuperAdminStats() {
    const [totalOrganisations, totalCustomers, totalEmployees] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.ADMIN } }),
      this.userRepo.count({ where: { role: UserRole.CUSTOMER } }),
      this.userRepo.count({ where: { role: UserRole.EMPLOYEE } }),
    ]);

    const allPayments = await this.paymentRepo.find();
    const revenueAnalytics = this.buildMonthlyRevenue(allPayments);

    const allCustomers = await this.userRepo.find({ where: { role: UserRole.CUSTOMER } });
    const customerActivity = this.buildMonthlyCustomers(allCustomers);

    return {
      stats: {
        totalOrganisations: { value: totalOrganisations, change: await this.calcChange(UserRole.ADMIN) },
        totalCustomers:     { value: totalCustomers,     change: await this.calcChange(UserRole.CUSTOMER) },
        totalEmployees:     { value: totalEmployees,     change: await this.calcChange(UserRole.EMPLOYEE) },
      },
      revenueAnalytics,
      customerActivity,
    };
  }

  async getAdminStats(organisationId: string) {
    const [verifiedCustomers, newCustomers, subAdmins, openTickets] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.CUSTOMER, organisationId, isActive: true } }),
      this.userRepo.count({ where: { role: UserRole.CUSTOMER, organisationId } }),
      this.userRepo.count({ where: { role: UserRole.EMPLOYEE, organisationId } }),
      this.issueRepo.count({ where: { organisationId, status: IssueStatus.PENDING } }),
    ]);

    const payments = await this.paymentRepo.find({ where: { organisationId } });
    const revenueAnalytics = this.buildRevenueAnalytics(payments);

    const customers = await this.userRepo.find({
      where: { organisationId, role: UserRole.CUSTOMER },
    });
    const customerActivity = this.buildMonthlyCustomers(customers);

    const topLocations = await this.buildTopLocations(organisationId);

    return {
      stats: {
        verifiedCustomers: { value: verifiedCustomers, change: 0 },
        newCustomers:      { value: newCustomers,      change: 0 },
        openTickets:       { value: openTickets,       change: 0 },
        subAdmins:         { value: subAdmins,         change: 0 },
      },
      revenueAnalytics,
      customerActivity,
      topLocations,
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
        total:      { value: total,      label: 'Total Assigned' },
        pending:    { value: pending,    label: 'Open Tickets'   },
        inProgress: { value: inProgress, label: 'In Progress'    },
        resolved:   { value: resolved,   label: 'Resolved'       },
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


  private buildRevenueAnalytics(payments: Payment[]) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months.map((month, idx) => {
      const mp = payments.filter((p) => new Date(p.createdAt).getMonth() === idx);
      return {
        month,
        success: mp.filter((p) => p.status === PaymentStatus.PAID).reduce((s, p) => s + Number(p.amount), 0),
        pending: mp.filter((p) => p.status === PaymentStatus.PENDING).reduce((s, p) => s + Number(p.amount), 0),
        failed:  mp.filter((p) => p.status === PaymentStatus.FAILED).reduce((s, p) => s + Number(p.amount), 0),
      };
    });
  }

  private buildMonthlyRevenue(payments: Payment[]) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months.map((month, idx) => ({
      month,
      value: payments
        .filter((p) => new Date(p.createdAt).getMonth() === idx)
        .reduce((s, p) => s + Number(p.amount), 0),
    }));
  }

  private buildMonthlyCustomers(customers: User[]) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months.map((month, idx) => ({
      month,
      value: customers.filter((c) => new Date(c.createdAt).getMonth() === idx).length,
    }));
  }

  private async buildTopLocations(organisationId: string) {
    const customers = await this.userRepo.find({
      where: { organisationId, role: UserRole.CUSTOMER },
    });

    const total = customers.length;
    if (total === 0) {
      return [
        { country: 'No Data', value: 100, color: 'rgba(101,16,127,0.2)' },
      ];
    }

    const countryCounts: Record<string, number> = {};
    customers.forEach((c) => {
      const country = c.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    const colors = [
      'rgba(101,16,127,1)',
      'rgba(101,16,127,0.6)',
      'rgba(101,16,127,0.35)',
      'rgba(101,16,127,0.15)',
    ];

    return Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([country, count], i) => ({
        country,
        value: Math.round((count / total) * 100 * 10) / 10,
        color: colors[i] ?? colors[3],
      }));
  }

  private async calcChange(role: UserRole): Promise<number> {
    const now       = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [thisCount, lastCount] = await Promise.all([
      this.userRepo.count({ where: { role } }),
      this.userRepo.createQueryBuilder('u')
        .where('u.role = :role', { role })
        .andWhere('u.createdAt < :thisMonth', { thisMonth })
        .getCount(),
    ]);

    if (lastCount === 0) return 0;
    return Math.round(((thisCount - lastCount) / lastCount) * 100 * 100) / 100;
  }
}
