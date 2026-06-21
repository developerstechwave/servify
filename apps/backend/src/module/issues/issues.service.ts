import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue, IssueStatus } from './entities/issue.entity';
import { IssueComment } from './entities/issue-comment.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private issueRepo: Repository<Issue>,
    @InjectRepository(IssueComment)
    private commentRepo: Repository<IssueComment>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async createIssue(customerId: string, organisationId: string, dto: CreateIssueDto) {
    const customer = await this.userRepo.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const issue = this.issueRepo.create({
      ...dto,
      customerId,
      organisationId,
      customerName: `${customer.firstName} ${customer.lastName}`,
      status:       IssueStatus.PENDING,
    });
    const saved = await this.issueRepo.save(issue);

    // Notify all admins
    const admins = await this.userRepo.find({
      where: { organisationId, role: UserRole.ADMIN },
    });
    for (const admin of admins) {
      await this.notificationsService.create({
        userId:         admin.id,
        organisationId,
        type:           NotificationType.ISSUE,
        title:          'New Issue Created',
        message:        `${customer.firstName} ${customer.lastName} created an issue`,
        issueId:        saved.id,
        issueTopic:     saved.topic,
        issueStatus:    saved.status,
        actorName:      `${customer.firstName} ${customer.lastName}`,
      });
    }

    return saved;
  }

  async getAll(organisationId: string, status?: IssueStatus, search?: string) {
    let issues = await this.issueRepo.find({
      where:     { organisationId },
      relations: { comments: true },
      order:     { createdAt: 'DESC' },
    });
    if (status) issues = issues.filter((i) => i.status === status);
    if (search) {
      const q = search.toLowerCase();
      issues = issues.filter(
        (i) => i.topic.toLowerCase().includes(q) ||
               i.customerName?.toLowerCase().includes(q) ||
               i.description.toLowerCase().includes(q),
      );
    }
    return issues.map((i) => ({
      id:           i.id,
      topic:        i.topic,
      description:  i.description,
      status:       i.status,
      customerName: i.customerName,
      serviceName:  i.serviceName,
      assigneeId:   i.assigneeId,
      assigneeName: i.assigneeName,
      commentCount: i.comments?.length ?? 0,
      createdAt:    i.createdAt,
    }));
  }

  async getAssignedIssues(employeeId: string, organisationId: string, status?: IssueStatus, search?: string) {
    let issues = await this.issueRepo.find({
      where:     { organisationId, assigneeId: employeeId },
      relations: { comments: true },
      order:     { createdAt: 'DESC' },
    });
    if (status) issues = issues.filter((i) => i.status === status);
    if (search) {
      const q = search.toLowerCase();
      issues = issues.filter(
        (i) => i.topic.toLowerCase().includes(q) ||
               i.customerName?.toLowerCase().includes(q),
      );
    }
    return issues.map((i) => ({
      id:           i.id,
      topic:        i.topic,
      description:  i.description,
      status:       i.status,
      customerName: i.customerName,
      serviceName:  i.serviceName,
      assigneeId:   i.assigneeId,
      assigneeName: i.assigneeName,
      commentCount: i.comments?.length ?? 0,
      createdAt:    i.createdAt,
    }));
  }

  async getCustomerIssues(customerId: string) {
    return this.issueRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getOne(id: string, organisationId: string) {
    const issue = await this.issueRepo.findOne({
      where:     { id, organisationId },
      relations: { comments: true },
    });
    if (!issue) throw new NotFoundException('Issue not found');
    return issue;
  }

  async updateIssue(id: string, organisationId: string, dto: UpdateIssueDto, actorName?: string) {
    const issue = await this.issueRepo.findOne({ where: { id, organisationId } });
    if (!issue) throw new NotFoundException('Issue not found');
    const oldStatus = issue.status;
    Object.assign(issue, dto);
    const saved = await this.issueRepo.save(issue);

    // Notify customer of status change
    if (dto.status && dto.status !== oldStatus && actorName) {
      await this.notificationsService.notifyStatusChange(saved, actorName);
    }

    return saved;
  }

  async assignTicket(id: string, organisationId: string, employeeId: string, actorName?: string) {
    const issue = await this.issueRepo.findOne({ where: { id, organisationId } });
    if (!issue) throw new NotFoundException('Issue not found');

    const employee = await this.userRepo.findOne({
      where: { id: employeeId, organisationId, role: UserRole.EMPLOYEE },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    issue.assigneeId   = employee.id;
    issue.assigneeName = `${employee.firstName} ${employee.lastName}`;
    issue.status       = IssueStatus.IN_PROGRESS;
    const saved = await this.issueRepo.save(issue);

    // Notify employee
    await this.notificationsService.notifyIssueAssigned(
      saved,
      employee.id,
      actorName || 'Admin',
    );

    return saved;
  }

  async addComment(issueId: string, authorId: string, body: string) {
    const issue = await this.issueRepo.findOne({ where: { id: issueId } });
    if (!issue) throw new NotFoundException('Issue not found');

    const author = await this.userRepo.findOne({ where: { id: authorId } });
    if (!author) throw new NotFoundException('Author not found');

    const comment = this.commentRepo.create({
      issueId,
      authorId,
      authorName: `${author.firstName} ${author.lastName}`,
      body,
    });
    const saved = await this.commentRepo.save(comment);

    // Notify customer if commenter is not the customer
    if (issue.customerId !== authorId) {
      await this.notificationsService.notifyComment(
        issue,
        `${author.firstName} ${author.lastName}`,
      );
    }

    return saved;
  }

  async getOrgEmployees(organisationId: string) {
    const employees = await this.userRepo.find({
      where: { organisationId, role: UserRole.EMPLOYEE, isActive: true },
    });
    return employees.map((e) => ({
      id:     e.id,
      name:   `${e.firstName} ${e.lastName}`,
      role:   e.employeeRole || 'Employee',
      avatar: e.avatar,
    }));
  }
}
