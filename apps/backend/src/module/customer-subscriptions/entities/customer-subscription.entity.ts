import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SubscriptionStatus {
  CURRENT      = 'current',
  PENDING      = 'pending',
  EXPIRED      = 'expired',
  UNSUBSCRIBED = 'unsubscribed',
}

@Entity('customer_subscriptions')
export class CustomerSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column()
  organisationId: string;

  @Column()
  productId: string;

  @Column()
  productName: string;

  @Column()
  serviceId: string;

  @Column()
  serviceName: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  billingType: string;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.PENDING })
  status: SubscriptionStatus;

  @Column({ nullable: true, type: 'date' })
  expiryDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
