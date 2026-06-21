import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from './entities/product.entity';
import { Service } from './entities/service.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,
  ) {}

  // ── PRODUCTS ─────────────────────────────────────────────────
  async getProducts(organisationId: string, search?: string) {
    const products = await this.productRepo.find({
      where: search
        ? { organisationId, name: ILike(`%${search}%`) }
        : { organisationId },
      relations: { services: true },
      order: { createdAt: 'DESC' },
    });

    return products.map((p) => ({
      id:           p.id,
      name:         p.name,
      description:  p.description,
      region:       p.region,
      country:      p.country,
      vat:          p.vat,
      createdBy:    p.createdBy,
      createdAt:    p.createdAt,
      noOfServices: p.services?.length ?? 0,
    }));
  }

  async getAllProducts(organisationId: string) {
    return this.productRepo.find({
      where:  { organisationId },
      select: { id: true, name: true },
    });
  }

  async getServicesByProduct(organisationId: string, productId: string) {
    return this.serviceRepo.find({
      where: { organisationId, productId },
      select: { id: true, name: true, price: true, vat: true, expiryDate: true },
    });
  }

  async createProduct(organisationId: string, createdBy: string, dto: CreateProductDto) {
    const product = this.productRepo.create({ ...dto, organisationId, createdBy });
    return this.productRepo.save(product);
  }

  async updateProduct(id: string, organisationId: string, dto: UpdateProductDto) {
    const product = await this.productRepo.findOne({ where: { id, organisationId } });
    if (!product) throw new NotFoundException('Product not found');
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async deleteProduct(id: string, organisationId: string) {
    const product = await this.productRepo.findOne({ where: { id, organisationId } });
    if (!product) throw new NotFoundException('Product not found');
    await this.productRepo.remove(product);
    return { message: 'Product deleted' };
  }

  // ── SERVICES ─────────────────────────────────────────────────
  async getServices(organisationId: string, search?: string) {
    const services = await this.serviceRepo.find({
      where: search
        ? { organisationId, name: ILike(`%${search}%`) }
        : { organisationId },
      relations: { product: true },
      order: { createdAt: 'DESC' },
    });

    return services.map((s) => ({
      id:          s.id,
      name:        s.name,
      price:       s.price,
      vat:         s.vat,
      region:      s.region,
      status:      s.status,
      expiryDate:  s.expiryDate,
      createdAt:   s.createdAt,
      productId:   s.productId,
      productName: s.product?.name ?? '',
    }));
  }

  async createService(organisationId: string, dto: CreateServiceDto) {
    const product = await this.productRepo.findOne({
      where: { id: dto.productId, organisationId },
    });
    if (!product) throw new NotFoundException('Product not found');
    const service = this.serviceRepo.create({ ...dto, organisationId });
    return this.serviceRepo.save(service);
  }

  async updateService(id: string, organisationId: string, dto: UpdateServiceDto) {
    const service = await this.serviceRepo.findOne({ where: { id, organisationId } });
    if (!service) throw new NotFoundException('Service not found');
    Object.assign(service, dto);
    return this.serviceRepo.save(service);
  }

  async deleteService(id: string, organisationId: string) {
    const service = await this.serviceRepo.findOne({ where: { id, organisationId } });
    if (!service) throw new NotFoundException('Service not found');
    await this.serviceRepo.remove(service);
    return { message: 'Service deleted' };
  }
}
