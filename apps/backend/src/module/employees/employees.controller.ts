import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmployeesService } from './employees.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('employees')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class EmployeesController {
  constructor(private service: EmployeesService) {}

  @Get()
  getAll(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('filter') filter?: string,
  ) {
    return this.service.getAll(req.user.organisationId, search, filter);
  }

  @Post()
  create(@Req() req: any, @Body() body: {
    employees: {
      fullName: string;
      email:    string;
      phone?:   string;
      role?:    string;
      region?:  string;
      country?: string;
    }[];
  }) {
    return this.service.createEmployees(
      req.user.organisationId,
      `${req.user.firstName} ${req.user.lastName}`,
      body.employees,
    );
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: {
      fullName?: string;
      email?:    string;
      phone?:    string;
      role?:     string;
      region?:   string;
      country?:  string;
    },
  ) {
    return this.service.updateEmployee(id, req.user.organisationId, body);
  }

  @Patch(':id/deactivate')
  deactivate(@Req() req: any, @Param('id') id: string) {
    return this.service.setStatus(id, req.user.organisationId, false);
  }

  @Patch(':id/activate')
  activate(@Req() req: any, @Param('id') id: string) {
    return this.service.setStatus(id, req.user.organisationId, true);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.removeEmployee(id, req.user.organisationId);
  }
}
