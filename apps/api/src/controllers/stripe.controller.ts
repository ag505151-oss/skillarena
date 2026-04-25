import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '@skillarena/db';
import { ok, fail } from '../utils/helpers';

function addDays(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function stripeWebhook(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !sig) { res.status(400).json(fail('Missing webhook secret')); return; }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) { res.status(500).json(fail('Stripe not configured')); return; }

  const stripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' as const });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, secret);
  } catch {
    res.status(400).json(fail('Invalid webhook signature'));
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;
    if (!userId || !plan) { res.json(ok({})); return; }

    const expiryMap: Record<string, Date | null> = {
      monthly: addDays(30),
      '6month': addDays(180),
      annual: addDays(365),
      lifetime: null,
    };

    await prisma.user.update({
      where: { id: userId },
      data: { plan: 'PRO', planExpiresAt: expiryMap[plan] ?? null },
    });
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
    await prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: { plan: 'FREE', planExpiresAt: null },
    });
  }

  res.json(ok({ received: true }));
}
