import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) {}

  async create(data: {
    userId:         string;
    organisationId: string;
    type:           NotificationType;
    title:          string;
    message:        string;
    issueId?:       string;
    issueTopic?:    string;
    issueStatus?:   string;
    actorName?:     string;
    actorAvatar?:   string;
  }) {
    const notification = this.repo.create(data);
    return this.repo.save(notification);
  }

  async getForUser(userId: string, type?: string, unreadOnly?: boolean) {
    let notifications = await this.repo.find({
      where:  { userId },
      order:  { createdAt: 'DESC' },
      take:   50,
    });

    // Only filter by type if explicitly provided
    if (type && type !== 'all') {
      notifications = notifications.filter((n) => n.type === type);
    }

    if (unreadOnly) {
      notifications = notifications.filter((n) => !n.isRead);
    }

    return notifications;
  }

  async getUnreadCount(userId: string) {
    const count = await this.repo.count({ where: { userId, isRead: false } });
    return { count };
  }

  async markAsRead(id: string, userId: string) {
    const n = await this.repo.findOne({ where: { id, userId } });
    if (!n) return;
    n.isRead = true;
    return this.repo.save(n);
  }

  async markAllAsRead(userId: string) {
    await this.repo
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('"userId" = :userId', { userId })
      .execute();
    return { message: 'All marked as read' };
  }

  async notifyIssueAssigned(issue: any, employeeId: string, actorName: string) {
    await this.create({
      userId:         employeeId,
      organisationId: issue.organisationId,
      type:           NotificationType.DIRECT,
      title:          'Ticket Assigned to You',
      message:        `${actorName} assigned an issue to you`,
      issueId:        issue.id,
      issueTopic:     issue.topic,
      issueStatus:    issue.status,
      actorName,
    });
  }

  async notifyComment(issue: any, authorName: string) {
    await this.create({
      userId:         issue.customerId,
      organisationId: issue.organisationId,
      type:           NotificationType.ISSUE,
      title:          'New Comment on Your Issue',
      message:        `${authorName} commented on your issue`,
      issueId:        issue.id,
      issueTopic:     issue.topic,
      issueStatus:    issue.status,
      actorName:      authorName,
    });
  }

  async notifyStatusChange(issue: any, actorName: string) {
    await this.create({
      userId:         issue.customerId,
      organisationId: issue.organisationId,
      type:           NotificationType.ISSUE,
      title:          'Issue Status Updated',
      message:        `${actorName} changed your issue status to ${issue.status.replace('_', ' ')}`,
      issueId:        issue.id,
      issueTopic:     issue.topic,
      issueStatus:    issue.status,
      actorName,
    });
  }
}
