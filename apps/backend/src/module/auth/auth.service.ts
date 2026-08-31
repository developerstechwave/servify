import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { Response, Request } from 'express';

import { User, UserRole } from './entities/user.entity';
import { Invitation, InvitationStatus } from './entities/invitation.entity';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Invitation)
    private invitationRepo: Repository<Invitation>,

    private jwtService: JwtService,
  ) {}

  private buildPayload(user: User) {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: user.organisationId,
    };
  }

  /**
   * Access token:
   * 15 minutes
   *
   * Refresh token:
   * 7 days
   */
  private signTokens(payload: object) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: 900,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: 604800,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Store refresh token in an HTTP-only cookie.
   *
   * The frontend JavaScript cannot access this cookie.
   */
  private setRefreshCookie(res: Response, token: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('refresh_token', token, {
      httpOnly: true,

      secure: isProduction,

      sameSite: isProduction ? 'lax' : 'lax',

      maxAge: 7 * 24 * 60 * 60 * 1000,

      path: '/',
    });
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.userRepo.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.lastLoginAt = new Date();

    await this.userRepo.save(user);

    const payload = this.buildPayload(user);

    const { accessToken, refreshToken } = this.signTokens(payload);

    this.setRefreshCookie(res, refreshToken);

    return {
      accessToken,

      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organisationId: user.organisationId,
      },
    };
  }

  async register(dto: RegisterDto, res: Response) {
    const invitation = await this.invitationRepo.findOne({
      where: {
        token: dto.token,
      },
    });

    if (!invitation) {
      throw new BadRequestException('Invalid registration token');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('This invitation has already been used');
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = InvitationStatus.EXPIRED;

      await this.invitationRepo.save(invitation);

      throw new BadRequestException('This invitation has expired');
    }

    const existing = await this.userRepo.findOne({
      where: {
        email: dto.email,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'An account with this email already exists',
      );
    }

    const isAdmin = dto.token.toUpperCase().startsWith('ADM');

    const role = isAdmin ? UserRole.ADMIN : UserRole.CUSTOMER;

    const organisationId = isAdmin ? uuidv4() : invitation.organisationId;

    const nameParts = dto.fullName.trim().split(' ');

    const firstName = nameParts[0];

    const lastName = nameParts.slice(1).join(' ') || '-';

    const user = this.userRepo.create({
      email: dto.email,

      password: await bcrypt.hash(dto.password, 12),

      firstName,
      lastName,

      role,

      organisationId,

      isActive: true,
    });

    await this.userRepo.save(user);

    invitation.status = InvitationStatus.ACCEPTED;

    await this.invitationRepo.save(invitation);

    const payload = this.buildPayload(user);

    const { accessToken, refreshToken } = this.signTokens(payload);

    this.setRefreshCookie(res, refreshToken);

    return {
      accessToken,

      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organisationId: user.organisationId,
      },
    };
  }

  async validateInvitationToken(token: string) {
    const invitation = await this.invitationRepo.findOne({
      where: {
        token,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invalid token');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Token already used');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Token expired');
    }

    return {
      valid: true,
      email: invitation.email,
      type: invitation.type,
      organisationId: invitation.organisationId,
    };
  }

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.refresh_token;

    if (!token) {
      throw new UnauthorizedException('No refresh token');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      }) as {
        sub: string;
      };

      const user = await this.userRepo.findOne({
        where: {
          id: payload.sub,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User is inactive');
      }

      const newPayload = this.buildPayload(user);

      const accessToken = this.jwtService.sign(newPayload, {
        secret: process.env.JWT_ACCESS_SECRET,

        expiresIn: 900,
      });

      /**
       * Optional but recommended:
       * refresh the refresh-token cookie too.
       *
       * This gives you a sliding 7-day session.
       */
      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: process.env.JWT_REFRESH_SECRET,

        expiresIn: 604800,
      });

      this.setRefreshCookie(res, newRefreshToken);

      return {
        accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return {
      message: 'Logged out successfully',
    };
  }

  async me(userId: string) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organisationId: user.organisationId,
    };
  }
}
