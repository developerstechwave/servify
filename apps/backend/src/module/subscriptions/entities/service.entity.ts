import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

export enum ServiceStatus {
  AVAILABLE   = 'available',
  UNAVAILABLE = 'unavailable',
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  vat: string;

  @Column({ nullable: true })
  region: string;

  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.AVAILABLE })
  status: ServiceStatus;

  @Column({ nullable: true, type: 'date' })
  expiryDate: Date;

  @Column()
  productId: string;

  @Column()
  organisationId: string;

  @ManyToOne(() => Product, (product) => product.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
