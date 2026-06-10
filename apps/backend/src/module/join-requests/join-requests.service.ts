import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { JoinRequest, JoinRequestStatus, JoinRequestType } from './entities/join-request.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { Invitation, InvitationType, InvitationStatus } from '../auth/entities/invitation.entity';
import { MailService } from '../../common/mail/mail.service';
import { CustomerJoinDto } from './dto/customer-join.dto';
import { OrganisationJoinDto } from './dto/organisation-join.dto';

@Injectable()
export class JoinRequestsService {
  constructor(
    @InjectRepository(JoinRequest)
    private joinRequestRepo: Repository<JoinRequest>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Invitation)
    private invitationRepo: Repository<Invitation>,
    private mailService: MailService,
  ) {}

  private async sendMailSafely(fn: () => Promise<void>) {
    try { await fn(); } catch {}
  }

  async getOrganisations() {
    const admins = await this.userRepo.find({
      where: { role: UserRole.ADMIN, isActive: true },
    });

    // Only return orgs that have a valid organisationId
    return admins
      .filter((a) => !!a.organisationId)
      .map((a) => ({
        id:   a.organisationId,
        name: `${a.firstName} ${a.lastName}`,
      }));
  }

  async customerJoinRequest(dto: CustomerJoinDto) {
    const existing = await this.joinRequestRepo.findOne({
      where: { email: dto.email, status: JoinRequestStatus.PENDING },
    });
    if (existing) throw new BadRequestException('A pending request already exists for this email');

    const request = this.joinRequestRepo.create({
      name:           dto.name,
      email:          dto.email,
      phone:          dto.phone,
      type:           JoinRequestType.CUSTOMER,
      organisationId: dto.organisationId,
      status:         JoinRequestStatus.PENDING,
    });
    await this.joinRequestRepo.save(request);

    await this.sendMailSafely(() =>
      this.mailService.sendRequestReceived({ to: dto.email, name: dto.name })
    );

    return { message: 'Request submitted successfully. You will be contacted shortly.' };
  }

  async organisationJoinRequest(dto: OrganisationJoinDto) {
    const existing = await this.joinRequestRepo.findOne({
      where: { email: dto.email, status: JoinRequestStatus.PENDING },
    });
    if (existing) throw new BadRequestException('A pending request already exists for this email');

    const request = this.joinRequestRepo.create({
      name:                dto.companyName,
      email:               dto.email,
      phone:               dto.phone,
      type:                JoinRequestType.ORGANISATION,
      businessCertificate: dto.businessCertificate,
      description:         dto.description,
      status:              JoinRequestStatus.PENDING,
    });
    await this.joinRequestRepo.save(request);

    await this.sendMailSafely(() =>
      this.mailService.sendRequestReceived({ to: dto.email, name: dto.companyName })
    );

    return { message: 'Request submitted. Our team will review and contact you.' };
  }

  async getPendingRequests(type?: JoinRequestType) {
    const where: any = { status: JoinRequestStatus.PENDING };
    if (type) where.type = type;
    return this.joinRequestRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getById(id: string) {
    const request = await this.joinRequestRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  async approveOrganisationRequest(requestId: string) {
    const request = await this.joinRequestRepo.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== JoinRequestStatus.PENDING) throw new BadRequestException('Request already processed');

    const token     = `ADM${uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = this.invitationRepo.create({
      token,
      email:     request.email,
      type:      InvitationType.ADMIN,
      status:    InvitationStatus.PENDING,
      expiresAt,
    });
    await this.invitationRepo.save(invitation);

    request.status = JoinRequestStatus.APPROVED;
    await this.joinRequestRepo.save(request);

    await this.sendMailSafely(() =>
      this.mailService.sendInvitation({
        to:        request.email,
        name:      request.name,
        token,
        message:   'Your organisation request has been approved. Use the token below to complete your registration on Servify.',
        expiresIn: '7 days',
      })
    );

    return { message: 'Organisation approved and invitation sent', token };
  }

  async approveCustomerRequest(requestId: string, adminOrganisationId: string) {
    const request = await this.joinRequestRepo.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== JoinRequestStatus.PENDING) throw new BadRequestException('Request already processed');

    const token     = `CDM${uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = this.invitationRepo.create({
      token,
      email:          request.email,
      type:           InvitationType.CUSTOMER,
      status:         InvitationStatus.PENDING,
      organisationId: adminOrganisationId,
      expiresAt,
    });
    await this.invitationRepo.save(invitation);

    request.status = JoinRequestStatus.APPROVED;
    await this.joinRequestRepo.save(request);

    await this.sendMailSafely(() =>
      this.mailService.sendInvitation({
        to:        request.email,
        name:      request.name,
        token,
        message:   'Your request to join has been approved. Use the token below to complete your registration.',
        expiresIn: '7 days',
      })
    );

    return { message: 'Customer approved and invitation sent', token };
  }

  async rejectRequest(requestId: string) {
    const request = await this.joinRequestRepo.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');
    request.status = JoinRequestStatus.REJECTED;
    await this.joinRequestRepo.save(request);
    return { message: 'Request rejected' };
  }
}
