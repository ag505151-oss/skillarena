import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@skillarena/db';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ok, fail } from '../utils/helpers';

const getUser = (req: Request, res: Response) => {
    // Your existing getUser logic here
};

const updateUser = (req: Request, res: Response) => {
    // Your existing updateUser logic here
};

export { getUser, updateUser };