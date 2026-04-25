import { Router } from 'express';

import { listNotifications, markAllAsRead, markAsRead } from '../controllers/notification.controller';

export const notificationRouter = Router();

notificationRouter.get('/', listNotifications);
notificationRouter.patch('/:id/read', markAsRead);
notificationRouter.patch('/read-all', markAllAsRead);
