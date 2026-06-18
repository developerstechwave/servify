import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { IssueComment } from './issue-comment.entity';

export enum IssueStatus {
  PENDING     = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED    = 'resolved',
  FAILED      = 'failed',
}

export enum IssueTopic {
  GENERAL_SUPPORT     = 'General Support',
  TECHNICAL_SUPPORT   = 'Technical Support',
  TRANSACTION         = 'Transaction',
  UNDELIVERED_PRODUCT = 'Undelivered Product',
  OTHER               = 'Other',
}

@Entity('issues')
export class Issue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: IssueTopic, default: IssueTopic.GENERAL_SUPPORT })
  topic: IssueTopic;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: IssueStatus, default: IssueStatus.PENDING })
  status: IssueStatus;

  @Column()
  organisationId: string;

  @Column()
  customerId: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  serviceId: string;

  @Column({ nullable: true })
  serviceName: string;

  @Column({ nullable: true })
  assigneeId: string;

  @Column({ nullable: true })
  assigneeName: string;

  @OneToMany(() => IssueComment, (c) => c.issue, { cascade: true })
  comments: IssueComment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
