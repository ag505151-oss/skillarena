import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { fail } from '../utils/helpers';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

type AllowedRole = 'SUPER_ADMIN' | 'ADMIN' | 'INTERVIEWER' | 'CANDIDATE';

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json(fail('Unauthorized'));
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'dev-secret');
    if (typeof decoded === 'object' && decoded !== null && 'id' in decoded && 'role' in decoded) {
      req.user = {
        id: String(decoded.id),
        role: String(decoded.role),
      };
      next();
      return;
    }

    res.status(401).json(fail('Invalid token payload'));
  } catch {
    res.status(401).json(fail('Invalid token'));
  }
}

export function requireRoles(...roles: AllowedRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(fail('Unauthorized'));
      return;
    }

    if (!roles.includes(req.user.role as AllowedRole)) {
      res.status(403).json(fail('Forbidden'));
      return;
    }

    next();
  };
}
