import { Router } from 'express';
import {
  getSettings, updateProfile, updateAccount, changeEmail, changePassword,
  updatePreferences, uploadAvatar, deleteAvatar, uploadResume, deleteResume,
  getSessions, revokeSession, revokeAllSessions, exportData, deleteAccount,
  getBillingHistory,
} from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const userRouter = Router();
userRouter.use(authMiddleware);

userRouter.get('/settings',          getSettings);
userRouter.patch('/profile',         updateProfile);
userRouter.patch('/account',         updateAccount);
userRouter.patch('/email',           changeEmail);
userRouter.patch('/password',        changePassword);
userRouter.patch('/preferences',     updatePreferences);
userRouter.post('/avatar',           uploadAvatar);
userRouter.delete('/avatar',         deleteAvatar);
userRouter.post('/resume',           uploadResume);
userRouter.delete('/resume',         deleteResume);
userRouter.get('/sessions',          getSessions);
userRouter.delete('/sessions/all',   revokeAllSessions);
userRouter.delete('/sessions/:id',   revokeSession);
userRouter.get('/export',            exportData);
userRouter.delete('/account',        deleteAccount);
userRouter.get('/billing/history',   getBillingHistory);
