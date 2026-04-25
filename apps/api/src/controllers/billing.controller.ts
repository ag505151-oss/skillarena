import type { Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '@skillarena/db';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ok, fail } from '../utils/helpers';

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia' as const });
}

const PRICE_MAP: Record<string, string | undefined> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  '6month': process.env.STRIPE_PRICE_6MONTH,
  annual: process.env.STRIPE_PRICE_ANNUAL,
  lifetime: process.env.STRIPE_PRICE_LIFETIME,
};

const ONE_TIME_PLANS = new Set(['6month', 'lifetime']);

export async function createCheckoutSession(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { plan } = req.body as { plan: string };
    const priceId = PRICE_MAP[plan];
    if (!priceId) { res.status(400).json(fail('Invalid plan')); return; }

    const stripe = getStripe();
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) { res.status(404).json(fail('User not found')); return; }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name });
      customerId = customer.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const isOneTime = ONE_TIME_PLANS.has(plan);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: isOneTime ? 'payment' : 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/dashboard?upgraded=1`,
      cancel_url: `${frontendUrl}/pricing`,
      metadata: { userId: user.id, plan },
    });

    res.json(ok({ url: session.url }, 'Checkout session created'));
  } catch (e: unknown) {
    res.status(500).json(fail(e instanceof Error ? e.message : 'Failed to create checkout session'));
  }
}

export async function cancelSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const stripe = getStripe();
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.stripeCustomerId) { res.status(400).json(fail('No active subscription')); return; }

    const subs = await stripe.subscriptions.list({ customer: user.stripeCustomerId, status: 'active', limit: 1 });
    if (subs.data.length === 0) { res.status(400).json(fail('No active subscription found')); return; }

    const subscription = subs.data[0];
    if (!subscription) { res.status(404).json(fail('No active subscription found')); return; }

    await stripe.subscriptions.cancel(subscription.id);
    await prisma.user.update({ where: { id: user.id }, data: { plan: 'FREE', planExpiresAt: null } });

    res.json(ok({ cancelled: true }, 'Subscription cancelled'));
  } catch (e: unknown) {
    res.status(500).json(fail(e instanceof Error ? e.message : 'Failed to cancel subscription'));
  }
}

export async function getBillingPortal(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const stripe = getStripe();
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.stripeCustomerId) { res.status(400).json(fail('No billing account found')); return; }

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${frontendUrl}/dashboard`,
    });

    res.json(ok({ url: session.url }));
  } catch (e: unknown) {
    res.status(500).json(fail(e instanceof Error ? e.message : 'Failed to open billing portal'));
  }
}
