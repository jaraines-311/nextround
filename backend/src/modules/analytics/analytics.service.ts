import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlanTier, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalUsers,
      freeUsers,
      proUsers,
      premiumUsers,
      activeSubscriptions,
      totalInterviews,
      voiceInterviews,
      totalFeedbackReports,
      creditsGrantedMonth,
      creditsPurchasedMonth,
      creditsConsumedMonth,
      aiCostsToday,
      aiCostsMonth,
      newSubsMonth,
      topUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.subscription.count({ where: { plan: PlanTier.FREE } }),
      this.prisma.subscription.count({ where: { plan: PlanTier.PRO, status: SubscriptionStatus.ACTIVE } }),
      this.prisma.subscription.count({ where: { plan: PlanTier.PREMIUM, status: SubscriptionStatus.ACTIVE } }),
      this.prisma.subscription.count({ where: { status: SubscriptionStatus.ACTIVE, plan: { not: PlanTier.FREE } } }),
      this.prisma.interviewSession.count(),
      this.prisma.interviewSession.count({ where: { mode: 'VOICE' } }),
      this.prisma.feedbackReport.count(),
      this.prisma.creditGrant.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.creditPurchase.aggregate({
        where: { completedAt: { gte: startOfMonth }, status: 'completed' },
        _sum: { amount: true },
      }),
      this.prisma.usageEvent.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { creditsConsumed: true },
      }),
      this.prisma.usageEvent.aggregate({
        where: { createdAt: { gte: startOfToday } },
        _sum: { providerCostUsd: true },
      }),
      this.prisma.usageEvent.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { providerCostUsd: true },
      }),
      this.prisma.subscription.count({
        where: { createdAt: { gte: startOfMonth }, plan: { not: PlanTier.FREE } },
      }),
      this.prisma.usageEvent.groupBy({
        by: ['userId'],
        _sum: { creditsConsumed: true },
        orderBy: { _sum: { creditsConsumed: 'desc' } },
        take: 10,
      }),
    ]);

    const proMRR = proUsers * 9.99;
    const premiumMRR = premiumUsers * 19.99;
    const totalMRR = proMRR + premiumMRR;
    const totalARR = totalMRR * 12;

    const costToday = aiCostsToday._sum.providerCostUsd ?? 0;
    const costMonth = aiCostsMonth._sum.providerCostUsd ?? 0;
    const grossMargin = totalMRR > 0 ? ((totalMRR - costMonth) / totalMRR) * 100 : 0;

    return {
      users: {
        total: totalUsers,
        free: freeUsers,
        pro: proUsers,
        premium: premiumUsers,
        paying: proUsers + premiumUsers,
      },
      revenue: {
        mrr: totalMRR,
        arr: totalARR,
        newSubscriptionsThisMonth: newSubsMonth,
        activeSubscriptions,
      },
      credits: {
        grantedThisMonth: creditsGrantedMonth._sum.amount ?? 0,
        purchasedThisMonth: creditsPurchasedMonth._sum.amount ?? 0,
        consumedThisMonth: creditsConsumedMonth._sum.creditsConsumed ?? 0,
      },
      usage: {
        totalInterviews,
        voiceInterviews,
        totalFeedbackReports,
      },
      aiCosts: {
        today: costToday,
        thisMonth: costMonth,
        grossMarginPercent: grossMargin,
        grossProfit: totalMRR - costMonth,
      },
      topUsersByConsumption: topUsers,
    };
  }
}
