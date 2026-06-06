import { Controller, Get, Post, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreditsService } from './credits.service';
import { Role } from '@prisma/client';
import { AdminAdjustDto } from './dto/admin-adjust.dto';

@ApiTags('credits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get my credit balance' })
  async getBalance(@Request() req) {
    return this.creditsService.getBalance(req.user.userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get my credit transaction history' })
  async getTransactions(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.creditsService.getTransactions(req.user.userId, +page, +limit);
  }

  @Post('admin/adjust/:userId')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: '[Admin] Adjust user credit balance' })
  async adminAdjust(@Param('userId') userId: string, @Body() dto: AdminAdjustDto) {
    return this.creditsService.adminAdjust(userId, dto.amount, dto.reason);
  }
}
