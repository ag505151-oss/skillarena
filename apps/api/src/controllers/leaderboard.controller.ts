import type { Request, Response } from 'express';

import { ok } from '../utils/helpers';

export async function getHackathonLeaderboard(_req: Request, res: Response): Promise<void> {
  res.json(ok([], 'Hackathon leaderboard endpoint ready'));
}
