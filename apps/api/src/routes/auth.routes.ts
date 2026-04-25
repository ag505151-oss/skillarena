import { Router } from 'express';
import { z } from 'zod';

import { forgotPassword, login, me, resetPassword, signup } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateMiddleware } from '../middleware/validate.middleware';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRouter = Router();
authRouter.post('/signup', validateMiddleware(signupSchema), signup);
authRouter.post('/login', validateMiddleware(loginSchema), login);
authRouter.post('/logout', (_req, res) => res.json({ success: true, message: 'Logged out' }));
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.get('/me', authMiddleware, me);
