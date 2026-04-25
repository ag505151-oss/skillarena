import { Router } from 'express';

import {
  createTest,
  getResult,
  getTestById,
  getTestLeaderboard,
  listTests,
  saveAttempt,
  startAttempt,
  submitAttempt,
} from '../controllers/test.controller';

export const testRouter = Router();

testRouter.get('/', listTests);
testRouter.post('/', createTest);
testRouter.get('/:id', getTestById);
testRouter.patch('/:id', (_req, res) => res.json({ success: true, data: { updated: true } }));
testRouter.delete('/:id', (_req, res) => res.json({ success: true, data: { deleted: true } }));
testRouter.post('/:id/attempt', startAttempt);
testRouter.patch('/:id/attempt/:attemptId', saveAttempt);
testRouter.post('/:id/submit', submitAttempt);
testRouter.get('/:id/result/:attemptId', getResult);
testRouter.get('/:id/leaderboard', getTestLeaderboard);
