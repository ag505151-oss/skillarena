import type { Request, Response } from 'express';

import { ok } from '../utils/helpers';

export async function judgeSubmission(_req: Request, res: Response): Promise<void> {
  res.status(202).json(ok({ token: 'todo' }, 'Judge job queued'));
}
