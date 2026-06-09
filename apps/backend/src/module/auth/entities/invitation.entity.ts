import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,


} from 'typeorm';

export enum InvitationStatus {
  PENDING  = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED  = 'expired',
}

export enum InvitationType {
  CUSTOMER = 'customer',
  ADMIN    = 'admin',
}

@Entity('invitations')
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  token: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: InvitationType })
  type: InvitationType;

  @Column({ type: 'enum', enum: InvitationStatus, default: InvitationStatus.PENDING })
  status: InvitationStatus;

  @Column({ nullable: true })
  organisationId: string;

  @Column({ nullable: true })
  invitedById: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
