import {
  Controller, Get, Post, Patch,
  Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IssuesService } from './issues.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { IssueStatus } from './entities/issue.entity';

@Controller('issues')
@UseGuards(AuthGuard('jwt'))
export class IssuesController {
  constructor(private service: IssuesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  create(@Req() req: any, @Body() dto: CreateIssueDto) {
    return this.service.createIssue(req.user.id, req.user.organisationId, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  getAll(
    @Req() req: any,
    @Query('status') status?: IssueStatus,
    @Query('search') search?: string,
  ) {
    return this.service.getAll(req.user.organisationId, status, search);
  }

  @Get('my')
  getMyIssues(@Req() req: any) {
    return this.service.getCustomerIssues(req.user.id);
  }

  @Get('assigned')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  getAssigned(
    @Req() req: any,
    @Query('status') status?: IssueStatus,
    @Query('search') search?: string,
  ) {
    return this.service.getAssignedIssues(req.user.id, req.user.organisationId, status, search);
  }

  @Get('employees')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  getEmployees(@Req() req: any) {
    return this.service.getOrgEmployees(req.user.organisationId);
  }

  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) {
    return this.service.getOne(id, req.user.organisationId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateIssueDto) {
    return this.service.updateIssue(id, req.user.organisationId, dto);
  }

  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  assign(@Req() req: any, @Param('id') id: string, @Body() body: { employeeId: string }) {
    return this.service.assignTicket(id, req.user.organisationId, body.employeeId);
  }

  @Post(':id/comments')
  addComment(@Req() req: any, @Param('id') id: string, @Body() body: { body: string }) {
    return this.service.addComment(id, req.user.id, body.body);
  }
}
