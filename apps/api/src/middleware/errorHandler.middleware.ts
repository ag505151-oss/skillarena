import type { NextFunction, Request, Response } from 'express';

import { logger } from '../utils/logger';
import { fail } from '../utils/helpers';

export function errorHandlerMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error({ err }, 'Unhandled error');
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json(fail(message));
}
