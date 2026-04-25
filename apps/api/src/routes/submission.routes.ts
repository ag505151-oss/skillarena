import { Router } from 'express';

import { judgeSubmission } from '../controllers/submission.controller';

export const submissionRouter = Router();

submissionRouter.post('/judge', judgeSubmission);
submissionRouter.get('/:id/status', (_req, res) => res.json({ success: true, data: { status: 'PENDING' } }));
