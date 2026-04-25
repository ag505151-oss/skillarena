import type { Request, Response } from 'express';

import { prisma } from '@skillarena/db';

import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { fail, ok } from '../utils/helpers';

function getUserId(req: AuthenticatedRequest): string | null {
  return req.user?.id ?? null;
}

export async function listNotifications(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json(fail('Unauthorized'));
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(ok(notifications, 'Notifications fetched'));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to fetch notifications'));
  }
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json(fail('Unauthorized'));
      return;
    }

    const paramId = req.params.id;
    if (!paramId || Array.isArray(paramId)) {
      res.status(400).json(fail('Notification id is required'));
      return;
    }

    const updated = await prisma.notification.updateMany({
      where: { id: paramId, userId },
      data: { isRead: true },
    });
    res.json(ok({ updated: updated.count > 0 }, 'Notification marked as read'));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to mark notification'));
  }
}

export async function markAllAsRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json(fail('Unauthorized'));
      return;
    }

    const updated = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    res.json(ok({ updated: updated.count }, 'All notifications marked as read'));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to mark all notifications'));
  }
}
