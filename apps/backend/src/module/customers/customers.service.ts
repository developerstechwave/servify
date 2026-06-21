import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../auth/entities/user.entity';
import { Invitation, InvitationType, InvitationStatus } from '../auth/entities/invitation.entity';
import { CustomerSubscription } from '../customer-subscriptions/entities/customer-subscription.entity';
import { Issue } from '../issues/entities/issue.entity';
import { MailService } from '../../common/mail/mail.service';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Invitation)
    private invitationRepo: Repository<Invitation>,
    @InjectRepository(CustomerSubscription)
    private subRepo: Repository<CustomerSubscription>,
    @InjectRepository(Issue)
    private issueRepo: Repository<Issue>,
    private mailService: MailService,
  ) {}

  private async sendMailSafely(fn: () => Promise<void>) {
    try { await fn(); } catch {}
  }

  async getAll(organisationId: string, search?: string, filter?: string) {
    let customers = await this.userRepo.find({
      where: { role: UserRole.CUSTOMER, organisationId },
      order: { createdAt: 'DESC' },
    });

    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q),
      );
    }

    if (filter === 'verified')   customers = customers.filter((c) =>  c.isActive);
    if (filter === 'unverified') customers = customers.filter((c) => !c.isActive);

    // Get latest subscription for each customer
    const result = [];
    for (const c of customers) {
      const latestSub = await this.subRepo.findOne({
        where: { customerId: c.id },
        order: { createdAt: 'DESC' },
      });
      result.push({
        id:            c.id,
        name:          `${c.firstName} ${c.lastName}`,
        email:         c.email,
        phone:         c.phone,
        isActive:      c.isActive,
        createdAt:     c.createdAt,
        service:       latestSub?.serviceName ?? null,
        datePurchased: latestSub?.createdAt ?? null,
      });
    }
    return result;
  }

  async getOne(id: string, organisationId: string) {
    const customer = await this.userRepo.findOne({
      where: { id, organisationId, role: UserRole.CUSTOMER },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    return {
      id:             customer.id,
      name:           `${customer.firstName} ${customer.lastName}`,
      firstName:      customer.firstName,
      lastName:       customer.lastName,
      email:          customer.email,
      phone:          customer.phone,
      country:        customer.country,
      region:         customer.region,
      address:        customer.address,
      avatar:         customer.avatar,
      isActive:       customer.isActive,
      createdAt:      customer.createdAt,
      organisationId: customer.organisationId,
    };
  }

  async getCustomerSubscriptions(customerId: string, organisationId: string) {
    const subs = await this.subRepo.find({
      where: { customerId, organisationId },
      order: { createdAt: 'DESC' },
    });
    return subs.map((s) => ({
      id:           s.id,
      product:      s.productName,
      service:      s.serviceName,
      description:  s.description,
      status:       s.status,
      datePurchased: s.createdAt,
      expiryDate:   s.expiryDate,
    }));
  }

  async getCustomerIssues(customerId: string, organisationId: string) {
    const issues = await this.issueRepo.find({
      where: { customerId, organisationId },
      order: { createdAt: 'DESC' },
    });
    return issues.map((i) => ({
      id:          i.id,
      topic:       i.topic,
      service:     i.serviceName,
      description: i.description,
      status:      i.status,
      dateIssued:  i.createdAt,
    }));
  }

  async inviteCustomer(
    organisationId: string,
    name: string,
    email: string,
    phone?: string,
  ) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new BadRequestException('An account already exists for this email');

    const existingInvite = await this.invitationRepo.findOne({
      where: { email, status: InvitationStatus.PENDING, type: InvitationType.CUSTOMER },
    });
    if (existingInvite) throw new BadRequestException('A pending invitation already exists for this email');

    const token     = `CDM${uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = this.invitationRepo.create({
      token,
      email,
      type:           InvitationType.CUSTOMER,
      status:         InvitationStatus.PENDING,
      organisationId,
      expiresAt,
    });
    await this.invitationRepo.save(invitation);

    await this.sendMailSafely(() =>
      this.mailService.sendInvitation({
        to:        email,
        name,
        token,
        message:   'You have been invited to join as a customer.',
        expiresIn: '7 days',
      }),
    );

    return { message: 'Invitation sent successfully', token };
  }

  async reinviteCustomer(customerId: string, organisationId: string) {
    const customer = await this.userRepo.findOne({
      where: { id: customerId, organisationId, role: UserRole.CUSTOMER },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const token     = `CDM${uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = this.invitationRepo.create({
      token,
      email:          customer.email,
      type:           InvitationType.CUSTOMER,
      status:         InvitationStatus.PENDING,
      organisationId,
      expiresAt,
    });
    await this.invitationRepo.save(invitation);

    await this.sendMailSafely(() =>
      this.mailService.sendInvitation({
        to:        customer.email,
        name:      `${customer.firstName} ${customer.lastName}`,
        token,
        message:   'You have been reinvited.',
        expiresIn: '7 days',
      }),
    );

    return { message: 'Reinvitation sent successfully', token };
  }

  async removeCustomer(id: string, organisationId: string) {
    const customer = await this.userRepo.findOne({
      where: { id, organisationId, role: UserRole.CUSTOMER },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    await this.userRepo.remove(customer);
    return { message: 'Customer removed' };
  }
}
