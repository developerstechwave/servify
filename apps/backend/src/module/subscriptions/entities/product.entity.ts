import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Service } from './service.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  vat: string;

  @Column()
  createdBy: string;

  @Column()
  organisationId: string;

  @OneToMany(() => Service, (service) => service.product)
  services: Service[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
