import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull, Not } from 'typeorm';
import { Issue, IssueStatus } from '../issues/entities/issue.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(Issue)
    private issueRepo: Repository<Issue>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  // Run every hour to check SLA breaches
  @Cron(CronExpression.EVERY_HOUR)
  async checkSLABreaches() {
    this.logger.log('Running SLA breach check...');

    const now = new Date();

    // Find issues that have breached SLA but not yet notified
    const breachedIssues = await this.issueRepo.find({
      where: [
        { status: IssueStatus.PENDING,     slaBreached: false },
        { status: IssueStatus.IN_PROGRESS, slaBreached: false },
      ],
    });

    for (const issue of breachedIssues) {
      if (!issue.slaDeadline) continue;
      if (new Date(issue.slaDeadline) > now) continue;

      // Mark as breached
      issue.slaBreached = true;
      issue.slaNotifiedAt = now;
      await this.issueRepo.save(issue);

      // Notify all admins of the org
      const admins = await this.userRepo.find({
        where: { organisationId: issue.organisationId, role: UserRole.ADMIN },
      });

      for (const admin of admins) {
        await this.notificationsService.create({
          userId:         admin.id,
          organisationId: issue.organisationId,
          type:           NotificationType.DIRECT,
          title:          'SLA Breach — Ticket Overdue',
          message:        `Ticket "${issue.topic}" from ${issue.customerName} has exceeded the 24-hour response deadline`,
          issueId:        issue.id,
          issueTopic:     issue.topic,
          issueStatus:    issue.status,
          actorName:      'System',
        });
      }

      // Also notify the assigned employee if any
      if (issue.assigneeId) {
        await this.notificationsService.create({
          userId:         issue.assigneeId,
          organisationId: issue.organisationId,
          type:           NotificationType.DIRECT,
          title:          'SLA Breach — Your Ticket is Overdue',
          message:        `The ticket "${issue.topic}" assigned to you has exceeded the 24-hour SLA deadline`,
          issueId:        issue.id,
          issueTopic:     issue.topic,
          issueStatus:    issue.status,
          actorName:      'System',
        });
      }

      this.logger.warn(`SLA breach notified for issue ${issue.id}`);
    }

    this.logger.log(`SLA check complete. ${breachedIssues.length} issues checked.`);
  }
}
