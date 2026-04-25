import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { adminRouter } from './routes/admin.routes';
import { authRouter } from './routes/auth.routes';
import { billingRouter } from './routes/billing.routes';
import { stripeRouter } from './routes/stripe.routes';
import { hackathonRouter } from './routes/hackathon.routes';
import { interviewRouter } from './routes/interview.routes';
import { notificationRouter } from './routes/notification.routes';
import { submissionRouter } from './routes/submission.routes';
import { testRouter } from './routes/test.routes';
import { userRouter } from './routes/user.routes';
import { authMiddleware, requireRoles } from './middleware/auth.middleware';
import { errorHandlerMiddleware } from './middleware/errorHandler.middleware';
import { apiRateLimit } from './middleware/rateLimit.middleware';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(apiRateLimit);

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/user', userRouter);
  app.use('/api/interviews', interviewRouter);
  app.use('/api/hackathons', hackathonRouter);
  app.use('/api/tests', testRouter);
  app.use('/api/submissions', submissionRouter);
  app.use('/api/billing', billingRouter);
  app.use('/api/stripe', stripeRouter);
  app.use('/api/admin', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), adminRouter);
  app.use('/api/notifications', authMiddleware, notificationRouter);

  app.use(errorHandlerMiddleware);

  return app;
}
