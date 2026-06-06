import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateCreditPurchaseDto } from './dto/create-credit-purchase.dto';
import { CreatePortalSessionDto } from './dto/create-portal-session.dto';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Create a Stripe checkout session for a subscription plan' })
  async createCheckout(@Request() req, @Body() dto: CreateCheckoutDto) {
    return this.billingService.createCheckoutSession(
      req.user.userId,
      dto.priceId,
      dto.successUrl,
      dto.cancelUrl,
    );
  }

  @Post('credits/purchase')
  @ApiOperation({ summary: 'Create a Stripe checkout session to purchase AI credits' })
  async purchaseCredits(@Request() req, @Body() dto: CreateCreditPurchaseDto) {
    return this.billingService.createCreditPurchaseSession(
      req.user.userId,
      dto.priceId,
      dto.creditAmount,
      dto.successUrl,
      dto.cancelUrl,
    );
  }

  @Post('portal')
  @ApiOperation({ summary: 'Create a Stripe billing portal session' })
  async createPortal(@Request() req, @Body() dto: CreatePortalSessionDto) {
    return this.billingService.createPortalSession(req.user.userId, dto.returnUrl);
  }

  @Get('subscription')
  @ApiOperation({ summary: 'Get current subscription status' })
  async getSubscription(@Request() req) {
    return this.billingService.getSubscription(req.user.userId);
  }
}
