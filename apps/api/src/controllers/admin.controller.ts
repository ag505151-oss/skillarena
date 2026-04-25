import type { Request, Response } from 'express';

import { ok } from '../utils/helpers';

export async function getAdminStats(_req: Request, res: Response): Promise<void> {
  res.json(ok({ users: 0, interviews: 0, hackathons: 0, tests: 0 }, 'Admin stats ready'));
}
