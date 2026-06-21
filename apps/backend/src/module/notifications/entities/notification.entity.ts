import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum NotificationType {
  DIRECT = 'direct',
  ISSUE  = 'issue',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  organisationId: string;

  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.ISSUE })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  issueId: string;

  @Column({ nullable: true })
  issueTopic: string;

  @Column({ nullable: true })
  issueStatus: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  actorName: string;

  @Column({ nullable: true })
  actorAvatar: string;

  @CreateDateColumn()
  createdAt: Date;
}
