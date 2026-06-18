import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return {
      id:             user.id,
      email:          user.email,
      firstName:      user.firstName,
      lastName:       user.lastName,
      role:           user.role,
      organisationId: user.organisationId,
      avatar:         user.avatar,
      phone:          (user as any).phone        || null,
      country:        (user as any).country      || null,
      region:         (user as any).region       || null,
      address:        (user as any).address      || null,
      description:    (user as any).description  || null,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.firstName) user.firstName   = dto.firstName;
    if (dto.lastName)  user.lastName    = dto.lastName;
    if (dto.email)     user.email       = dto.email;

    // Store extra fields — we'll add them to the entity next
    Object.assign(user, {
      phone:       dto.phone       ?? (user as any).phone,
      country:     dto.country     ?? (user as any).country,
      region:      dto.region      ?? (user as any).region,
      address:     dto.address     ?? (user as any).address,
      description: dto.description ?? (user as any).description,
    });

    await this.userRepo.save(user);
    return this.getProfile(userId);
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const match = await bcrypt.compare(dto.currentPassword, user.password);
    if (!match) throw new BadRequestException('Current password is incorrect');

    user.password = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepo.save(user);

    return { message: 'Password updated successfully' };
  }

  async updateAvatar(userId: string, filename: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.avatar = `/uploads/avatars/${filename}`;
    await this.userRepo.save(user);
    return { avatar: user.avatar };
  }

  async removeAvatar(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.avatar = null;
    await this.userRepo.save(user);
    return { message: 'Avatar removed' };
  }
}
