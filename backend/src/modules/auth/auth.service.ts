import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreditsService } from '../credits/credits.service';
import { RegisterDto } from './dto/register.dto';
import { BillingOverride, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly creditsService: CreditsService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    let billingOverride = BillingOverride.NONE;
    if (dto.accessCode && dto.accessCode === this.config.get('admin.freeForeverAccessCode')) {
      billingOverride = BillingOverride.FREE_FOREVER;
    }

    const isAdmin = dto.email.toLowerCase() === this.config.get('admin.email')?.toLowerCase();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: isAdmin ? Role.ADMIN : Role.USER,
        billingOverride,
        targetIndustry: dto.targetIndustry,
        candidateProfile: {
          create: {
            targetIndustry: dto.targetIndustry,
          },
        },
        subscription: {
          create: {
            stripeCustomerId: `placeholder_${Date.now()}`,
            plan: 'FREE',
          },
        },
      },
    });

    await this.creditsService.initializeBalance(user.id);

    const token = this.signToken(user.id, user.email, user.role);
    return { token, user: this.sanitizeUser(user) };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(user: any) {
    const token = this.signToken(user.id, user.email, user.role);
    return { token, user: this.sanitizeUser(user) };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return; // Silent fail for security

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    // In production, send email here
    return token;
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { token }, data: { usedAt: new Date() } }),
    ]);

    return { message: 'Password reset successfully' };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        creditBalance: true,
        candidateProfile: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  private signToken(userId: string, email: string, role: string) {
    return this.jwtService.sign({ sub: userId, email, role });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
