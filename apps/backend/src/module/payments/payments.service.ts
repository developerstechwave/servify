import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { User } from '../auth/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // Customer creates a payment (subscribes to service)
  async createPayment(customerId: string, organisationId: string, dto: CreatePaymentDto) {
    const customer = await this.userRepo.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const payment = this.paymentRepo.create({
      ...dto,
      customerId,
      organisationId,
      customerName: `${customer.firstName} ${customer.lastName}`,
      status: dto.status ?? PaymentStatus.PENDING,
    });
    return this.paymentRepo.save(payment);
  }

  // Admin gets all payments for their org
  async getAll(organisationId: string, status?: PaymentStatus, search?: string) {
    let payments = await this.paymentRepo.find({
      where:  { organisationId },
      order:  { createdAt: 'DESC' },
    });

    if (status) payments = payments.filter((p) => p.status === status);
    if (search) {
      const q = search.toLowerCase();
      payments = payments.filter(
        (p) =>
          p.customerName.toLowerCase().includes(q) ||
          p.serviceName.toLowerCase().includes(q) ||
          p.productName.toLowerCase().includes(q),
      );
    }

    return payments.map((p) => ({
      id:           p.id,
      customerName: p.customerName,
      serviceName:  p.serviceName,
      productName:  p.productName,
      amount:       p.amount,
      vat:          p.vat,
      status:       p.status,
      expiryDate:   p.expiryDate,
      createdAt:    p.createdAt,
    }));
  }

  // Customer gets their own payments
  async getMyPayments(customerId: string) {
    return this.paymentRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  // Admin updates payment status
  async updateStatus(id: string, organisationId: string, status: PaymentStatus) {
    const payment = await this.paymentRepo.findOne({ where: { id, organisationId } });
    if (!payment) throw new NotFoundException('Payment not found');
    payment.status = status;
    return this.paymentRepo.save(payment);
  }

  // Dashboard stats
  async getStats(organisationId: string) {
    const payments = await this.paymentRepo.find({ where: { organisationId } });
    const total  = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const paid   = payments.filter((p) => p.status === PaymentStatus.PAID).reduce((sum, p) => sum + Number(p.amount), 0);
    const pending = payments.filter((p) => p.status === PaymentStatus.PENDING).length;
    const failed  = payments.filter((p) => p.status === PaymentStatus.FAILED).length;
    return { total, paid, pending, failed, count: payments.length };
  }
}
