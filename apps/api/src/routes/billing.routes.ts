import { Router } from 'express';
import { createCheckoutSession, cancelSubscription, getBillingPortal } from '../controllers/billing.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const billingRouter = Router();
billingRouter.post('/create-checkout-session', authMiddleware, createCheckoutSession);
billingRouter.post('/cancel-subscription', authMiddleware, cancelSubscription);
billingRouter.get('/portal', authMiddleware, getBillingPortal);
