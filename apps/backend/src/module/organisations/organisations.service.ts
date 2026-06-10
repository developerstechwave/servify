import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async getAll(search?: string, status?: string) {
    const admins = await this.userRepo.find({
      where: { role: UserRole.ADMIN },
      order: { createdAt: 'DESC' },
    });

    let results = admins.map((admin) => ({
      organisationId: admin.organisationId,
      name:           `${admin.firstName} ${admin.lastName}`,
      email:          admin.email,
      isActive:       admin.isActive,
      createdAt:      admin.createdAt,
      products:       0,
      services:       0,
      customers:      0,
      employees:      0,
      issuesPending:  0,
      issuesResolved: 0,
    }));

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      );
    }

    if (status === 'active')      results = results.filter((r) =>  r.isActive);
    if (status === 'deactivated') results = results.filter((r) => !r.isActive);

    return results;
  }

  async inviteOrganisation(companyName: string, email: string, phone?: string) {
    // Check no pending invitation already exists for this email
    const existing = await this.invitationRepo.findOne({
      where: { email, status: InvitationStatus.PENDING, type: InvitationType.ADMIN },
    });
    if (existing) throw new BadRequestException('An invitation already exists for this email');

    // Check not already registered
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) throw new BadRequestException('An account already exists for this email');

    const token     = `ADM${uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = this.invitationRepo.create({
      token,
      email,
      type:      InvitationType.ADMIN,
      status:    InvitationStatus.PENDING,
      expiresAt,
    });
    await this.invitationRepo.save(invitation);

    await this.sendMailSafely(() =>
      this.mailService.sendInvitation({
        to:        email,
        name:      companyName,
        token,
        message:   `You have been invited to join Servify as an organisation. Use the token below to complete your registration.`,
        expiresIn: '7 days',
      })
    );

    return { message: 'Invitation sent successfully', token };
  }

  async setStatus(organisationId: string, isActive: boolean) {
    const admin = await this.userRepo.findOne({
      where: { organisationId, role: UserRole.ADMIN },
    });
    if (!admin) throw new NotFoundException('Organisation not found');
    admin.isActive = isActive;
    await this.userRepo.save(admin);
    return { message: isActive ? 'Organisation activated' : 'Organisation deactivated' };
  }

  async delete(organisationId: string) {
    const admin = await this.userRepo.findOne({
      where: { organisationId, role: UserRole.ADMIN },
    });
    if (!admin) throw new NotFoundException('Organisation not found');
    await this.userRepo.delete({ organisationId });
    return { message: 'Organisation deleted' };
  }
}
