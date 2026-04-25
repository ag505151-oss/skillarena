import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { prisma } from '@skillarena/db';

import { fail, ok } from '../utils/helpers';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

interface AuthTokenPayload {
  id: string;
  role: string;
  email: string;
}

function buildAuthToken(payload: AuthTokenPayload): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is missing');
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: '7d',
  });
}

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json(fail('Email already registered'));
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: 'CANDIDATE',
        skills: [],
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });

    const token = buildAuthToken({ id: user.id, role: user.role, email: user.email });
    res.status(201).json(ok({ user, token }, 'Signup successful'));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Signup failed'));
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        password: true,
      },
    });

    if (!user?.password) {
      res.status(401).json(fail('Invalid credentials'));
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json(fail('Invalid credentials'));
      return;
    }

    const token = buildAuthToken({ id: user.id, role: user.role, email: user.email });
    res.status(200).json(
      ok(
        {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
          },
        },
        'Login successful',
      ),
    );
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Login failed'));
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json(fail('Unauthorized'));
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json(fail('JWT secret not configured'));
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as AuthTokenPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        skills: true,
      },
    });

    if (!user) {
      res.status(404).json(fail('User not found'));
      return;
    }

    res.status(200).json(ok(user));
  } catch {
    res.status(401).json(fail('Invalid token'));
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(fail(parsed.error.issues.map((issue) => issue.message).join(', ')));
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true },
    });
    if (!user) {
      res.status(200).json(ok({ sent: true }, 'If the account exists, reset instructions were sent'));
      return;
    }

    const resetToken = buildAuthToken({
      id: user.id,
      role: 'CANDIDATE',
      email: user.email,
    });

    res.status(200).json(
      ok(
        {
          sent: true,
          resetToken,
        },
        'Reset token generated',
      ),
    );
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Forgot password failed'));
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(fail(parsed.error.issues.map((issue) => issue.message).join(', ')));
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json(fail('JWT secret not configured'));
      return;
    }

    const payload = jwt.verify(parsed.data.token, jwtSecret) as AuthTokenPayload;
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await prisma.user.update({
      where: { id: payload.id },
      data: { password: passwordHash },
    });

    res.status(200).json(ok({ reset: true }, 'Password reset successful'));
  } catch {
    res.status(400).json(fail('Invalid or expired reset token'));
  }
}
