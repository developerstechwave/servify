import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from './subscriptions.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('subscriptions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class SubscriptionsController {
  constructor(private service: SubscriptionsService) {}

  // Products
  @Get('products')
  getProducts(@Req() req: any, @Query('search') search?: string) {
    return this.service.getProducts(req.user.organisationId, search);
  }

  @Get('products/all')
  getAllProducts(@Req() req: any) {
    return this.service.getAllProducts(req.user.organisationId);
  }

  @Post('products')
  createProduct(@Req() req: any, @Body() dto: CreateProductDto) {
    const createdBy = `${req.user.firstName} ${req.user.lastName}`;
    return this.service.createProduct(req.user.organisationId, createdBy, dto);
  }

  @Patch('products/:id')
  updateProduct(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.updateProduct(id, req.user.organisationId, dto);
  }

  @Delete('products/:id')
  deleteProduct(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteProduct(id, req.user.organisationId);
  }

  // Services
  @Get('services')
  getServices(@Req() req: any, @Query('search') search?: string) {
    return this.service.getServices(req.user.organisationId, search);
  }

  @Post('services')
  createService(@Req() req: any, @Body() dto: CreateServiceDto) {
    return this.service.createService(req.user.organisationId, dto);
  }

  @Patch('services/:id')
  updateService(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.service.updateService(id, req.user.organisationId, dto);
  }

  @Delete('services/:id')
  deleteService(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteService(id, req.user.organisationId);
  }
}
