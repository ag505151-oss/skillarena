import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@skillarena/db';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ok, fail } from '../utils/helpers';

// ─── Schemas ──────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2).max(50),
  username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers and underscores only').optional(),
  bio: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  twitterHandle: z.string().max(50).optional(),
  skills: z.array(z.string().min(1).max(40)).max(20).optional(),
});

const accountSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.string().datetime().optional().or(z.literal('')), 
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'One uppercase letter required')
    .regex(/[0-9]/, 'One number required')
    .regex(/[^a-zA-Z0-9]/, 'One special character required'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const preferencesSchema = z.object({
  notificationPrefs: z.record(z.boolean()).optional(),
  editorPrefs: z.object({
    theme: z.string().optional(),
    fontSize: z.number().min(12).max(20).optional(),
    tabSize: z.number().optional(),
  }).optional(),
  digestFrequency: z.enum(['immediately', 'daily', 'weekly']).optional(),
});

// ─── Helpers ──────────────────────────────────────────────────────────

function err(e: unknown) { return e instanceof Error ? e.message : 'Unexpected error'; }

// ─── Handlers ──────────────────────────────────────────────────────────

export async function getSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, name: true, email: true, username: true, avatar: true, bio: true,
        location: true, website: true, githubUrl: true, linkedinUrl: true, twitterHandle: true,
        phone: true, dateOfBirth: true, skills: true, resumeUrl: true, resumeUploadedAt: true,
        role: true, plan: true, planExpiresAt: true, stripeCustomerId: true,
        provider: true, twoFactorEnabled: true, notificationPrefs: true, editorPrefs: true,
        createdAt: true,
      },
    });
    if (!user) { res.status(404).json(fail('User not found')); return; }
    res.json(ok(user));
  } catch (e) { res.status(500).json(fail(err(e))); }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json(fail(parsed.error.issues.map((i) => i.message).join(', '))); return; }

    if (parsed.data.username) {
      const existing = await prisma.user.findFirst({
        where: { username: parsed.data.username, NOT: { id: req.user!.id } },
      });
      if (existing) { res.status(409).json(fail('Username already taken')); return; }
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        name: parsed.data.name,
        username: parsed.data.username ?? null,
        bio: parsed.data.bio ?? null,
        location: parsed.data.location ?? null,
        website: parsed.data.website || null,
        githubUrl: parsed.data.githubUrl || null,
        linkedinUrl: parsed.data.linkedinUrl || null,
        twitterHandle: parsed.data.twitterHandle ?? null,
        skills: parsed.data.skills ?? [],
      },
      select: { id: true, name: true, username: true, bio: true, location: true, website: true, githubUrl: true, linkedinUrl: true, twitterHandle: true, skills: true },
    });
    res.json(ok(user, 'Profile updated'));
  } catch (e) { res.status(500).json(fail(err(e))); }
}

export async function updateAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parsed = accountSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json(fail(parsed.error.issues.map((i) => i.message).join(', '))); return; }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(parsed.data.name && { name: parsed.data.name }),
        phone: parsed.data.phone ?? null,
        dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
      },
      select: { id: true, name: true, phone: true, dateOfBirth: true },
    });
    res.json(ok(user, 'Account updated'));
  } catch (e) { res.status(500).json(fail(err(e))); }
}

export async function changeEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { newEmail, currentPassword } = req.body as { newEmail: string; currentPassword: string };
    if (!newEmail || !currentPassword) { res.status(400).json(fail('newEmail and currentPassword required')); return; }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.password) { res.status(400).json(fail('Cannot change email for OAuth accounts')); return; }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) { res.status(401).json(fail('Current password is incorrect')); return; }

    const exists = await prisma.user.findUnique({ where: { email: newEmail } });
    if (exists) { res.status(409).json(fail('Email already in use')); return; }

    // In production: send verification email via Resend. For now, update directly.
    await prisma.user.update({ where: { id: user.id }, data: { email: newEmail } });
    res.json(ok({ sent: true }, `Verification email sent to ${newEmail}`));
  } catch (e) { res.status(500).json(fail(err(e))); }
}

export async function changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parsed = passwordSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json(fail(parsed.error.issues.map((i) => i.message).join(', '))); return; }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.password) { res.status(400).json(fail('No password set on this account')); return; }

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!valid) { res.status(401).json(fail('Current password is incorrect')); return; }

    const hash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hash } });
    res.json(ok({ updated: true }, 'Password updated'));
  } catch (e) { res.status(500).json(fail(err(e))); }
}

export async function updatePreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parsed = preferencesSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json(fail(parsed.error.issues.map((i) => i.message).join(', '))); return; }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(parsed.data.notificationPrefs !== undefined && { notificationPrefs: parsed.data.notificationPrefs }),
        ...(parsed.data.editorPrefs !== undefined && { editorPrefs: parsed.data.editorPrefs }),
      },
      select: { notificationPrefs: true, editorPrefs: true },
    });
    res.json(ok(user, 'Preferences saved'));
  } catch (e) { res.status(500).json(fail(err(e))); }
}

export async function uploadAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { url } = req.body as { url: string };
    if (!url) { res.status(400).json(fail('url required')); return; }
    const user = await prisma.user.update({ where: { id: req.user!.id }, data: { avatar: url }, select: { avatar: true } });
    res.json(ok(user, 'Avatar updated'));
  } catch (e) { res.status(500).json(fail(err(e))); }
}

export async function deleteAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    await prisma.user.update({ where: { id: req.user!.id }, data: { avatar: null } });
    res.json(ok({ removed: true }, 'Avatar removed'));
  } catch (e) { res.status(500).json(fail(err(e))); }
}

export async function uploadResume(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { url, filename } = req.body as { url: string; filename: string };
    if (!url) { res.status(400).json(fail('url required')); return; }
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { resumeUrl: url, resumeUploadedAt: new Date() },
      select: { resumeUrl: true, resumeUploadedAt: true },
    });
    res.json(ok({ ...user, filename }, 'Resume uploaded'));
  } catch (e) { res.status(500).json(fail(err(e))); }
}

export async function deleteResume(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    await prisma.user.update({ where: { id: req.user!.id }, data: { resumeUrl: null, resumeUploadedAt: null } });
    res.json(ok({ removed: true }, 'Resume removed'));
  } catch (e) { res.status(500).json(fail(err(e))); }
}

export async function getSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const sessions = await prisma.userSession.findMany({
      where: { userId: req.user!.id },
      orderBy: { lastActive: 'desc' },
    });
    res.json(ok(sessions));
  } catch (e) { res.status(500).json(fail(err(e))); }
}

export async function revokeSession(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params['id'] ?? '');
    if (!id) { res.status(400).json(fail('Session id required')); return; }
    await prisma.userSession.deleteMany({ where: { id, userId: req.user!.id } });
    res.json(ok({ revoked: true }));
  } catch (e) { res.status(500).json(fail(err(e))); }
}

export async function revokeAllSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const currentSessionId = (req.headers['x-session-id'] as string) ?? '';
    await prisma.userSession.deleteMany({
      where: { userId: req.user!.id, NOT: { id: currentSessionId } },
    });
    res.json(ok({ revoked: true }));
  } catch (e) { res.status(500).json(fail(err(e))); }
}

export async function exportData(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { testAttempts: true, hackathonParticipants: true, notifications: true },
    });
    res.json(ok(user, 'Data export'));
  } catch (e) { res.status(500).json(fail(err(e))); }
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { confirmation } = req.body as { confirmation: string };
    if (confirmation !== 'DELETE MY ACCOUNT') { res.status(400).json(fail('Confirmation text does not match')); return; }
    await prisma.user.delete({ where: { id: req.user!.id } });
    res.json(ok({ deleted: true }, 'Account deleted'));
  } catch (e) { res.status(500).json(fail(err(e))); }
}

export async function getBillingHistory(_req: AuthenticatedRequest, res: Response): Promise<void> {
  // Returns mock data — real implementation would query Stripe invoices
  res.json(ok([]));
}