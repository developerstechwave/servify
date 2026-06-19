import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CustomerSubscription, SubscriptionStatus } from './entities/customer-subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class CustomerSubscriptionsService {
  constructor(
    @InjectRepository(CustomerSubscription)
    private repo: Repository<CustomerSubscription>,
  ) {}

  async create(customerId: string, organisationId: string, dto: CreateSubscriptionDto) {
    const sub = this.repo.create({
      ...dto,
      customerId,
      organisationId,
      status: dto.status ?? SubscriptionStatus.PENDING,
    });
    return this.repo.save(sub);
  }

  async getAll(customerId: string, search?: string, status?: string) {
    let subs = await this.repo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });

    if (search) {
      const q = search.toLowerCase();
      subs = subs.filter(
        (s) =>
          s.productName.toLowerCase().includes(q) ||
          s.serviceName.toLowerCase().includes(q),
      );
    }

    if (status) subs = subs.filter((s) => s.status === status);

    return subs;
  }

  async getOne(id: string, customerId: string) {
    const sub = await this.repo.findOne({ where: { id, customerId } });
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  async update(id: string, customerId: string, data: Partial<CreateSubscriptionDto>) {
    const sub = await this.repo.findOne({ where: { id, customerId } });
    if (!sub) throw new NotFoundException('Subscription not found');
    Object.assign(sub, data);
    return this.repo.save(sub);
  }

  async unsubscribe(id: string, customerId: string) {
    const sub = await this.repo.findOne({ where: { id, customerId } });
    if (!sub) throw new NotFoundException('Subscription not found');
    sub.status = SubscriptionStatus.UNSUBSCRIBED;
    return this.repo.save(sub);
  }

  async delete(id: string, customerId: string) {
    const sub = await this.repo.findOne({ where: { id, customerId } });
    if (!sub) throw new NotFoundException('Subscription not found');
    await this.repo.remove(sub);
    return { message: 'Subscription deleted' };
  }

  async getStats(customerId: string) {
    const subs = await this.repo.find({ where: { customerId } });
    return {
      total:        subs.length,
      current:      subs.filter((s) => s.status === SubscriptionStatus.CURRENT).length,
      pending:      subs.filter((s) => s.status === SubscriptionStatus.PENDING).length,
      expired:      subs.filter((s) => s.status === SubscriptionStatus.EXPIRED).length,
      unsubscribed: subs.filter((s) => s.status === SubscriptionStatus.UNSUBSCRIBED).length,
    };
  }
}
