import { Router } from 'express';

import { getAdminStats } from '../controllers/admin.controller';

export const adminRouter = Router();

adminRouter.get('/stats', getAdminStats);
adminRouter.get('/users', (_req, res) => res.json({ success: true, data: [] }));
adminRouter.patch('/users/:id/role', (_req, res) => res.json({ success: true, data: { updated: true } }));
adminRouter.delete('/users/:id', (_req, res) => res.json({ success: true, data: { deleted: true } }));
adminRouter.get('/submissions', (_req, res) => res.json({ success: true, data: [] }));
adminRouter.post('/disqualify/:userId', (_req, res) => res.json({ success: true, data: { disqualified: true } }));
