import { Router } from 'express';

import {
  createHackathon,
  getHackathonById,
  getHackathonLeaderboard,
  getHackathonProblems,
  getHackathonSubmissions,
  listHackathons,
  registerHackathon,
  submitHackathonCode,
} from '../controllers/hackathon.controller';

export const hackathonRouter = Router();

hackathonRouter.get('/', listHackathons);
hackathonRouter.post('/', createHackathon);
hackathonRouter.get('/:id', getHackathonById);
hackathonRouter.patch('/:id', (_req, res) => res.json({ success: true, data: { updated: true } }));
hackathonRouter.delete('/:id', (_req, res) => res.json({ success: true, data: { deleted: true } }));
hackathonRouter.post('/:id/register', registerHackathon);
hackathonRouter.get('/:id/leaderboard', getHackathonLeaderboard);
hackathonRouter.get('/:id/problems', getHackathonProblems);
hackathonRouter.post('/:id/submit', submitHackathonCode);
hackathonRouter.get('/:id/submissions', getHackathonSubmissions);
