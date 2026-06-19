import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../auth/entities/user.entity';
import { MailService } from '../../common/mail/mail.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private mailService: MailService,
  ) {}

  private generatePassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
    return Array.from({ length: 10 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }

  private async sendMailSafely(fn: () => Promise<void>) {
    try { await fn(); } catch {}
  }

  async getAll(organisationId: string, search?: string, filter?: string) {
    let employees = await this.userRepo.find({
      where: { role: UserRole.EMPLOYEE, organisationId },
      order: { createdAt: 'DESC' },
    });

    if (search) {
      const q = search.toLowerCase();
      employees = employees.filter(
        (e) =>
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q),
      );
    }

    if (filter === 'verified')    employees = employees.filter((e) =>  e.isActive);
    if (filter === 'deactivated') employees = employees.filter((e) => !e.isActive);

    return employees.map((e) => ({
      id:        e.id,
      name:      `${e.firstName} ${e.lastName}`,
      email:     e.email,
      phone:     e.phone,
      country:   e.country,
      region:    e.region,
      role:      (e as any).employeeRole || 'Employee',
      isActive:  e.isActive,
      createdAt: e.createdAt,
    }));
  }

  async createEmployees(
    organisationId: string,
    createdBy: string,
    employees: {
      fullName: string;
      email:    string;
      phone?:   string;
      role?:    string;
      region?:  string;
      country?: string;
    }[],
  ) {
    const results = [];

    for (const emp of employees) {
      const existing = await this.userRepo.findOne({ where: { email: emp.email } });
      if (existing) {
        results.push({ email: emp.email, status: 'skipped', reason: 'Email already exists' });
        continue;
      }

      const password = this.generatePassword();

      const nameParts = emp.fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName  = nameParts.slice(1).join(' ') || '-';

      const user = this.userRepo.create({
        email:          emp.email,
        password:       await bcrypt.hash(password, 12),
        firstName,
        lastName,
        role:           UserRole.EMPLOYEE,
        organisationId,
        phone:          emp.phone,
        region:         emp.region,
        country:        emp.country,
        isActive:       true,
      });

      // Store employee role as a custom field
      (user as any).employeeRole = emp.role || 'Employee';

      await this.userRepo.save(user);
      console.log(`Employee created: ${emp.email} | Password: ${password}`);

      await this.sendMailSafely(() =>
        this.mailService.sendWelcomeEmployee({
          to:       emp.email,
          name:     emp.fullName,
          password,
          role:     emp.role || 'Employee',
        }),
      );

      results.push({ email: emp.email, status: 'created' });
    }

    return { message: 'Employees processed', results };
  }

  async updateEmployee(
    id: string,
    organisationId: string,
    data: {
      fullName?: string;
      email?:    string;
      phone?:    string;
      role?:     string;
      region?:   string;
      country?:  string;
    },
  ) {
    const employee = await this.userRepo.findOne({
      where: { id, organisationId, role: UserRole.EMPLOYEE },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    if (data.fullName) {
      const parts = data.fullName.trim().split(' ');
      employee.firstName = parts[0];
      employee.lastName  = parts.slice(1).join(' ') || '-';
    }
    if (data.email)   employee.email   = data.email;
    if (data.phone)   employee.phone   = data.phone;
    if (data.region)  employee.region  = data.region;
    if (data.country) employee.country = data.country;
    if (data.role)    (employee as any).employeeRole = data.role;

    await this.userRepo.save(employee);
    return { message: 'Employee updated' };
  }

  async setStatus(id: string, organisationId: string, isActive: boolean) {
    const employee = await this.userRepo.findOne({
      where: { id, organisationId, role: UserRole.EMPLOYEE },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    employee.isActive = isActive;
    await this.userRepo.save(employee);
    return { message: isActive ? 'Employee activated' : 'Employee deactivated' };
  }

  async removeEmployee(id: string, organisationId: string) {
    const employee = await this.userRepo.findOne({
      where: { id, organisationId, role: UserRole.EMPLOYEE },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    await this.userRepo.remove(employee);
    return { message: 'Employee removed' };
  }
}
