import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { OrgRole } from './entities/role.entity';
import { User, UserRole } from '../auth/entities/user.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(OrgRole)
    private roleRepo: Repository<OrgRole>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getAll(organisationId: string, userId: string, search?: string) {
    const roles = await this.roleRepo.find({
      where: search
        ? { organisationId, name: ILike(`%${search}%`) }
        : { organisationId },
      order: { createdAt: 'DESC' },
    });

    const employees = await this.userRepo.find({
      where: { organisationId, role: UserRole.EMPLOYEE },
    });

    return roles.map((r) => ({
      id:          r.id,
      name:        r.name,
      createdBy:   r.createdBy,
      createdAt:   r.createdAt,
      noOfEmployees: employees.filter(
        (e) => (e as any).employeeRole === r.name
      ).length,
    }));
  }

  async createRoles(organisationId: string, createdBy: string, names: string[]) {
    const results = [];
    for (const name of names) {
      const existing = await this.roleRepo.findOne({
        where: { organisationId, name },
      });
      if (existing) {
        results.push({ name, status: 'skipped', reason: 'Role already exists' });
        continue;
      }
      const role = this.roleRepo.create({ name, organisationId, createdBy });
      await this.roleRepo.save(role);
      results.push({ name, status: 'created' });
    }
    return { message: 'Roles processed', results };
  }

  async updateRole(id: string, organisationId: string, name: string) {
    const role = await this.roleRepo.findOne({ where: { id, organisationId } });
    if (!role) throw new NotFoundException('Role not found');

    const existing = await this.roleRepo.findOne({ where: { organisationId, name } });
    if (existing && existing.id !== id) throw new BadRequestException('Role name already exists');

    role.name = name;
    await this.roleRepo.save(role);
    return { message: 'Role updated' };
  }

  async deleteRole(id: string, organisationId: string) {
    const role = await this.roleRepo.findOne({ where: { id, organisationId } });
    if (!role) throw new NotFoundException('Role not found');
    await this.roleRepo.remove(role);
    return { message: 'Role deleted successfully' };
  }
}
