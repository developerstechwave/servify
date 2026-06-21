import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from './subscriptions.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('subscriptions')
@UseGuards(AuthGuard('jwt'))
export class SubscriptionsController {
  constructor(private service: SubscriptionsService) {}

  // ── OPEN TO ALL AUTHENTICATED USERS ──────────────────────────

  @Get('products/all')
  getAllProducts(@Req() req: any) {
    return this.service.getAllProducts(req.user.organisationId);
  }

  @Get('services/public')
  getServicesPublic(@Req() req: any, @Query('productId') productId?: string) {
    return this.service.getServicesByProduct(req.user.organisationId, productId || '');
  }

  // ── ADMIN ONLY ────────────────────────────────────────────────

  @Get('products')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getProducts(@Req() req: any, @Query('search') search?: string) {
    return this.service.getProducts(req.user.organisationId, search);
  }

  @Post('products')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  createProduct(@Req() req: any, @Body() dto: CreateProductDto) {
    return this.service.createProduct(
      req.user.organisationId,
      `${req.user.firstName} ${req.user.lastName}`,
      dto,
    );
  }

  @Patch('products/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateProduct(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.updateProduct(id, req.user.organisationId, dto);
  }

  @Delete('products/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteProduct(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteProduct(id, req.user.organisationId);
  }

  @Get('services')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getServices(@Req() req: any, @Query('search') search?: string) {
    return this.service.getServices(req.user.organisationId, search);
  }

  @Post('services')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  createService(@Req() req: any, @Body() dto: CreateServiceDto) {
    return this.service.createService(req.user.organisationId, dto);
  }

  @Patch('services/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateService(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.service.updateService(id, req.user.organisationId, dto);
  }

  @Delete('services/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteService(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteService(id, req.user.organisationId);
  }
}
