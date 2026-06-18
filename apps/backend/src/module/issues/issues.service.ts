import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue, IssueStatus } from './entities/issue.entity';
import { IssueComment } from './entities/issue-comment.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private issueRepo: Repository<Issue>,
    @InjectRepository(IssueComment)
    private commentRepo: Repository<IssueComment>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // Customer creates an issue
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
    return this.issueRepo.save(issue);
  }

  // Admin/Employee gets all issues for their org
  async getAll(organisationId: string, status?: IssueStatus, search?: string) {
    let issues = await this.issueRepo.find({
      where:   { organisationId },
      relations: { comments: true },
      order:   { createdAt: 'DESC' },
    });

    if (status) issues = issues.filter((i) => i.status === status);
    if (search) {
      const q = search.toLowerCase();
      issues = issues.filter(
        (i) =>
          i.topic.toLowerCase().includes(q) ||
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

  // Customer gets their own issues
  async getCustomerIssues(customerId: string) {
    return this.issueRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  // Get single issue with comments
  async getOne(id: string, organisationId: string) {
    const issue = await this.issueRepo.findOne({
      where:     { id, organisationId },
      relations: { comments: true },
    });
    if (!issue) throw new NotFoundException('Issue not found');
    return issue;
  }

  // Admin updates status or assigns
  async updateIssue(id: string, organisationId: string, dto: UpdateIssueDto) {
    const issue = await this.issueRepo.findOne({ where: { id, organisationId } });
    if (!issue) throw new NotFoundException('Issue not found');
    Object.assign(issue, dto);
    return this.issueRepo.save(issue);
  }

  // Assign ticket to employee
  async assignTicket(id: string, organisationId: string, employeeId: string) {
    const issue = await this.issueRepo.findOne({ where: { id, organisationId } });
    if (!issue) throw new NotFoundException('Issue not found');

    const employee = await this.userRepo.findOne({
      where: { id: employeeId, organisationId, role: UserRole.EMPLOYEE },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    issue.assigneeId   = employee.id;
    issue.assigneeName = `${employee.firstName} ${employee.lastName}`;
    issue.status       = IssueStatus.IN_PROGRESS;

    return this.issueRepo.save(issue);
  }

  // Add comment
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
    return this.commentRepo.save(comment);
  }

  // Get employees for assign modal
  async getOrgEmployees(organisationId: string) {
    const employees = await this.userRepo.find({
      where: { organisationId, role: UserRole.EMPLOYEE, isActive: true },
    });
    return employees.map((e) => ({
      id:     e.id,
      name:   `${e.firstName} ${e.lastName}`,
      role:   (e as any).employeeRole || 'Employee',
      avatar: e.avatar,
    }));
  }
}
