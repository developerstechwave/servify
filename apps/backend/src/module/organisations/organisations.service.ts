import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../auth/entities/user.entity';
import { Invitation, InvitationType, InvitationStatus } from '../auth/entities/invitation.entity';
import { MailService } from '../../common/mail/mail.service';

@Injectable()
export class OrganisationsService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Invitation)
    private invitationRepo: Repository<Invitation>,
    private mailService: MailService,
  ) {}

  private async sendMailSafely(fn: () => Promise<void>) {
    try { await fn(); } catch {}
  }

  async getAll(search?: string) {
    const admins = await this.userRepo.find({
      where: { role: UserRole.ADMIN },
      order: { createdAt: 'DESC' },
    });

    // Get all pending invitations to show not-yet-registered orgs
    const pendingInvites = await this.invitationRepo.find({
      where: { type: InvitationType.ADMIN, status: InvitationStatus.PENDING },
    });

    const registeredOrgs = admins.map((a) => ({
      id:             a.id,
      organisationId: a.organisationId,
      name:           `${a.firstName} ${a.lastName}`,
      email:          a.email,
      isActive:       a.isActive,
      verified:       true, // registered = verified
      createdAt:      a.createdAt,
      customerCount:  0,
      employeeCount:  0,
    }));

    const pendingOrgs = pendingInvites.map((inv) => ({
      id:             inv.id,
      organisationId: null,
      name:           inv.email.split('@')[0],
      email:          inv.email,
      isActive:       false,
      verified:       false, // invited but not registered
      createdAt:      inv.createdAt,
      customerCount:  0,
      employeeCount:  0,
    }));

    let all = [...registeredOrgs, ...pendingOrgs];

    if (search) {
      const q = search.toLowerCase();
      all = all.filter(
        (o) => o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q),
      );
    }

    // Get customer and employee counts for registered orgs
    for (const org of registeredOrgs) {
      if (org.organisationId) {
        org.customerCount = await this.userRepo.count({
          where: { organisationId: org.organisationId, role: UserRole.CUSTOMER },
        });
        org.employeeCount = await this.userRepo.count({
          where: { organisationId: org.organisationId, role: UserRole.EMPLOYEE },
        });
      }
    }

    return all;
  }

  async inviteOrganisation(email: string, name: string) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new Error('An account already exists for this email');

    const token     = `ADM${uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = this.invitationRepo.create({
      token,
      email,
      type:       InvitationType.ADMIN,
      status:     InvitationStatus.PENDING,
      expiresAt,
    });
    await this.invitationRepo.save(invitation);

    await this.sendMailSafely(() =>
      this.mailService.sendInvitation({
        to:        email,
        name,
        token,
        message:   'You have been invited to join Servify as an organisation administrator.',
        expiresIn: '7 days',
      }),
    );

    return { message: 'Invitation sent', token };
  }

  async activate(organisationId: string) {
    const admin = await this.userRepo.findOne({ where: { organisationId, role: UserRole.ADMIN } });
    if (!admin) throw new NotFoundException('Organisation not found');
    admin.isActive = true;
    await this.userRepo.save(admin);
    return { message: 'Organisation activated' };
  }

  async deactivate(organisationId: string) {
    const admin = await this.userRepo.findOne({ where: { organisationId, role: UserRole.ADMIN } });
    if (!admin) throw new NotFoundException('Organisation not found');
    admin.isActive = false;
    await this.userRepo.save(admin);
    return { message: 'Organisation deactivated' };
  }

  async delete(organisationId: string) {
    const users = await this.userRepo.find({ where: { organisationId } });
    await this.userRepo.remove(users);
    return { message: 'Organisation deleted' };
  }
}
