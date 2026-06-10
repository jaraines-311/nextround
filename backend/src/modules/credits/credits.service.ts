import {
  Injectable,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { BillingOverride, CreditTransactionType, PlanTier, Role } from '@prisma/client';

export interface ConsumeCreditsOptions {
  userId: string;
  amount: number;
  feature: string;
  sessionId?: string;
  tokensUsed?: number;
  providerCostUsd?: number;
  aiProvider?: string;
  aiModel?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async initializeBalance(userId: string) {
    const freeCredits = this.config.get<number>('credits.freeInitial');
    await this.prisma.$transaction(async (tx) => {
      const balance = await tx.creditBalance.create({
        data: { userId, subscriptionCredits: freeCredits, lifetimeGranted: freeCredits },
      });

      await tx.creditGrant.create({
        data: { userId, amount: freeCredits, plan: PlanTier.FREE, reason: 'initial_signup' },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.GRANT_INITIAL,
          amount: freeCredits,
          balanceBefore: 0,
          balanceAfter: freeCredits,
          description: 'Initial free credits',
        },
      });
    });
  }

  async getBalance(userId: string) {
    const balance = await this.prisma.creditBalance.findUnique({ where: { userId } });
    if (!balance) throw new NotFoundException('Credit balance not found');

    const total = balance.subscriptionCredits + balance.purchasedCredits;
    return { ...balance, total };
  }

  async getTotalBalance(userId: string): Promise<number> {
    const balance = await this.prisma.creditBalance.findUnique({ where: { userId } });
    if (!balance) return 0;
    return balance.subscriptionCredits + balance.purchasedCredits;
  }

  async canAfford(userId: string, amount: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, billingOverride: true },
    });
    if (!user) return false;

    // Admins and free-forever users have unlimited credits
    if (user.role === Role.ADMIN || user.billingOverride === BillingOverride.FREE_FOREVER) return true;

    const total = await this.getTotalBalance(userId);
    return total >= amount;
  }

  async consume(options: ConsumeCreditsOptions): Promise<void> {
    const { userId, amount, feature } = options;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, billingOverride: true },
    });

    // Skip accounting for privileged users
    if (user?.role === Role.ADMIN || user?.billingOverride === BillingOverride.FREE_FOREVER) {
      await this.recordUsageEvent({ ...options, creditsConsumed: 0 });
      return;
    }

    const balance = await this.prisma.creditBalance.findUnique({ where: { userId } });
    if (!balance) throw new NotFoundException('Credit balance not found');

    const total = balance.subscriptionCredits + balance.purchasedCredits;
    if (total < amount) throw new ForbiddenException('Insufficient AI credits');

    // Deduct from subscription credits first, then purchased
    let remainingToDeduct = amount;
    let subDeduction = 0;
    let purchDeduction = 0;

    if (balance.subscriptionCredits >= remainingToDeduct) {
      subDeduction = remainingToDeduct;
    } else {
      subDeduction = balance.subscriptionCredits;
      purchDeduction = remainingToDeduct - subDeduction;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.creditBalance.update({
        where: { userId },
        data: {
          subscriptionCredits: { decrement: subDeduction },
          purchasedCredits: { decrement: purchDeduction },
          lifetimeConsumed: { increment: amount },
        },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.CONSUME,
          amount: -amount,
          balanceBefore: total,
          balanceAfter: total - amount,
          description: `Consumed for ${feature}`,
          metadata: { feature },
        },
      });

      await tx.usageEvent.create({
        data: {
          userId,
          sessionId: options.sessionId,
          feature,
          creditsConsumed: amount,
          tokensUsed: options.tokensUsed,
          providerCostUsd: options.providerCostUsd,
          aiProvider: options.aiProvider as any,
          aiModel: options.aiModel,
          metadata: options.metadata,
        },
      });
    });
  }

  async grantMonthlyCredits(userId: string, plan: PlanTier) {
    const monthlyAmount = this.getMonthlyGrantForPlan(plan);
    if (monthlyAmount === 0) return;

    const maxMultiplier = this.config.get<number>('credits.maxMultiplier');
    const maxBalance = monthlyAmount * maxMultiplier;

    const balance = await this.prisma.creditBalance.findUnique({ where: { userId } });
    if (!balance) return;

    const newAmount = Math.min(balance.subscriptionCredits + monthlyAmount, maxBalance);
    const actualGranted = newAmount - balance.subscriptionCredits;

    if (actualGranted <= 0) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.creditBalance.update({
        where: { userId },
        data: {
          subscriptionCredits: newAmount,
          lifetimeGranted: { increment: actualGranted },
        },
      });

      await tx.creditGrant.create({
        data: { userId, amount: actualGranted, plan, reason: 'monthly_renewal' },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.GRANT_MONTHLY,
          amount: actualGranted,
          balanceBefore: balance.subscriptionCredits + balance.purchasedCredits,
          balanceAfter: newAmount + balance.purchasedCredits,
          description: `Monthly ${plan} plan credit renewal`,
        },
      });
    });
  }

  async grantPurchasedCredits(userId: string, amount: number, purchaseId: string) {
    const balance = await this.prisma.creditBalance.findUnique({ where: { userId } });
    const prevTotal = (balance?.subscriptionCredits ?? 0) + (balance?.purchasedCredits ?? 0);

    await this.prisma.$transaction(async (tx) => {
      await tx.creditBalance.update({
        where: { userId },
        data: {
          purchasedCredits: { increment: amount },
          lifetimeGranted: { increment: amount },
          lifetimePurchased: { increment: amount },
        },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.PURCHASE,
          amount,
          balanceBefore: prevTotal,
          balanceAfter: prevTotal + amount,
          description: `Purchased ${amount} AI credits`,
          relatedPurchaseId: purchaseId,
        },
      });
    });
  }

  async adminAdjust(userId: string, amount: number, reason: string) {
    const balance = await this.prisma.creditBalance.findUnique({ where: { userId } });
    const prevTotal = (balance?.subscriptionCredits ?? 0) + (balance?.purchasedCredits ?? 0);

    await this.prisma.$transaction(async (tx) => {
      if (amount > 0) {
        await tx.creditBalance.update({
          where: { userId },
          data: { subscriptionCredits: { increment: amount }, lifetimeGranted: { increment: amount } },
        });
      } else {
        const absAmount = Math.abs(amount);
        await tx.creditBalance.update({
          where: { userId },
          data: { subscriptionCredits: { decrement: Math.min(absAmount, balance.subscriptionCredits) } },
        });
      }

      await tx.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.ADMIN_ADJUSTMENT,
          amount,
          balanceBefore: prevTotal,
          balanceAfter: prevTotal + amount,
          description: reason,
        },
      });
    });
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await this.prisma.$transaction([
      this.prisma.creditTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.creditTransaction.count({ where: { userId } }),
    ]);

    return { data: transactions, total, page, limit };
  }

  getCostForFeature(feature: string): number {
    const costs = this.config.get<Record<string, number>>('credits.costs');
    const map: Record<string, number> = {
      voice_interview: costs.voiceInterview,
      feedback_report: costs.feedbackReport,
      question_generation: costs.questionGeneration,
      resume_analysis: costs.resumeAnalysis,
      job_analysis: costs.jobAnalysis,
      job_match_analysis: costs.jobMatchAnalysis,
    };
    return map[feature] ?? 10;
  }

  private getMonthlyGrantForPlan(plan: PlanTier): number {
    const credits = this.config.get<any>('credits');
    if (plan === PlanTier.PRO) return credits.proMonthly;
    if (plan === PlanTier.PREMIUM) return credits.premiumMonthly;
    return 0;
  }

  private async recordUsageEvent(options: ConsumeCreditsOptions & { creditsConsumed: number }) {
    await this.prisma.usageEvent.create({
      data: {
        userId: options.userId,
        sessionId: options.sessionId,
        feature: options.feature,
        creditsConsumed: options.creditsConsumed,
        tokensUsed: options.tokensUsed,
        providerCostUsd: options.providerCostUsd,
        aiProvider: options.aiProvider as any,
        aiModel: options.aiModel,
        metadata: options.metadata,
      },
    });
  }
}
