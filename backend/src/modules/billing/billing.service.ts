import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { PlanTier, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly creditsService: CreditsService,
  ) {
    const secretKey = config.get<string>('stripe.secretKey');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });
    } else {
      this.logger.warn('Stripe secret key not configured');
    }
  }

  async getOrCreateCustomer(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });
    if (!user) throw new NotFoundException('User not found');

    if (user.subscription?.stripeCustomerId && !user.subscription.stripeCustomerId.startsWith('placeholder_')) {
      return user.subscription.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: { userId },
    });

    await this.prisma.subscription.upsert({
      where: { userId },
      create: { userId, stripeCustomerId: customer.id, plan: PlanTier.FREE },
      update: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  async createCheckoutSession(userId: string, priceId: string, successUrl: string, cancelUrl: string) {
    const customerId = await this.getOrCreateCustomer(userId);

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId },
      subscription_data: { metadata: { userId } },
    });

    return { url: session.url, sessionId: session.id };
  }

  async createCreditPurchaseSession(
    userId: string,
    priceId: string,
    creditAmount: number,
    successUrl: string,
    cancelUrl: string,
  ) {
    const customerId = await this.getOrCreateCustomer(userId);

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, creditAmount: creditAmount.toString(), type: 'credit_purchase' },
    });

    const purchase = await this.prisma.creditPurchase.create({
      data: {
        userId,
        stripeSessionId: session.id,
        amount: creditAmount,
        priceInCents: 0,
        status: 'pending',
      },
    });

    return { url: session.url, sessionId: session.id, purchaseId: purchase.id };
  }

  async createPortalSession(userId: string, returnUrl: string) {
    const customerId = await this.getOrCreateCustomer(userId);
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return { url: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const webhookSecret = this.config.get<string>('stripe.webhookSecret');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    this.logger.log(`Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.CheckoutSession);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }

    return { received: true };
  }

  async getSubscription(userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    const plan = this.planFromPriceId(subscription.items.data[0]?.price.id);
    const status = this.mapStripeStatus(subscription.status);
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;

    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id,
        plan,
        status,
        cancelAtPeriodEnd,
        billingPeriodStart: new Date(subscription.current_period_start * 1000),
        billingPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      update: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id,
        plan: cancelAtPeriodEnd ? undefined : plan,
        pendingPlan: cancelAtPeriodEnd ? PlanTier.FREE : undefined,
        status,
        cancelAtPeriodEnd,
        billingPeriodStart: new Date(subscription.current_period_start * 1000),
        billingPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        plan: PlanTier.FREE,
        pendingPlan: null,
        status: SubscriptionStatus.CANCELED,
        stripeSubscriptionId: null,
      },
    });
  }

  private async handleCheckoutCompleted(session: Stripe.CheckoutSession) {
    if (session.metadata?.type === 'credit_purchase') {
      const { userId, creditAmount } = session.metadata;
      const credits = parseInt(creditAmount, 10);

      const purchase = await this.prisma.creditPurchase.findFirst({
        where: { stripeSessionId: session.id },
      });
      if (!purchase || purchase.status === 'completed') return;

      await this.prisma.creditPurchase.update({
        where: { id: purchase.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          priceInCents: session.amount_total ?? 0,
          stripePaymentIntentId: session.payment_intent as string,
        },
      });

      await this.creditsService.grantPurchasedCredits(userId, credits, purchase.id);
    }
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    if (invoice.billing_reason !== 'subscription_cycle') return;

    const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription as string);
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    const plan = this.planFromPriceId(subscription.items.data[0]?.price.id);
    await this.creditsService.grantMonthlyCredits(userId, plan);
  }

  private planFromPriceId(priceId: string): PlanTier {
    const stripe = this.config.get<any>('stripe');
    if (priceId === stripe.premiumPriceId) return PlanTier.PREMIUM;
    if (priceId === stripe.proPriceId) return PlanTier.PRO;
    return PlanTier.FREE;
  }

  private mapStripeStatus(status: string): SubscriptionStatus {
    const map: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      past_due: SubscriptionStatus.PAST_DUE,
      canceled: SubscriptionStatus.CANCELED,
      unpaid: SubscriptionStatus.UNPAID,
      trialing: SubscriptionStatus.TRIALING,
      paused: SubscriptionStatus.PAUSED,
    };
    return map[status] ?? SubscriptionStatus.ACTIVE;
  }
}
