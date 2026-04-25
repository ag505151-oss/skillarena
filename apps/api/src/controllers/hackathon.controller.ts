import type { Request, Response } from 'express';
import { z } from 'zod';

import { prisma } from '@skillarena/db';

import { queueJudge0Execution } from '../services/judge0.service';
import { fail, ok } from '../utils/helpers';

const createHackathonSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  maxTeamSize: z.number().int().min(1).max(4),
  allowedLangs: z.array(z.string().min(2)).min(1),
  isTeamMode: z.boolean().optional(),
  entryFee: z.number().nonnegative().optional(),
});

const registerSchema = z.object({
  userId: z.string().min(3),
  teamId: z.string().optional(),
});

const submitSchema = z.object({
  userId: z.string().min(3).optional(),
  teamId: z.string().optional(),
  problemId: z.string().min(3),
  language: z.string().min(2),
  languageId: z.number().int().positive(),
  code: z.string().min(10),
});

function getParam(value: string | string[] | undefined, name: string): string {
  if (!value || Array.isArray(value)) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export async function listHackathons(_req: Request, res: Response): Promise<void> {
  try {
    const hackathons = await prisma.hackathon.findMany({
      orderBy: { startAt: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        startAt: true,
        endAt: true,
        status: true,
        maxTeamSize: true,
        entryFee: true,
      },
    });
    res.json(ok(hackathons));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to list hackathons'));
  }
}

export async function createHackathon(req: Request, res: Response): Promise<void> {
  try {
    const parsed = createHackathonSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(fail(parsed.error.issues.map((issue) => issue.message).join(', ')));
      return;
    }

    const hackathon = await prisma.hackathon.create({
      data: {
        ...parsed.data,
        startAt: new Date(parsed.data.startAt),
        endAt: new Date(parsed.data.endAt),
        isTeamMode: parsed.data.isTeamMode ?? false,
        entryFee: parsed.data.entryFee ?? 0,
      },
      select: { id: true, title: true },
    });
    res.status(201).json(ok(hackathon, 'Hackathon created'));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to create hackathon'));
  }
}

export async function getHackathonById(req: Request, res: Response): Promise<void> {
  try {
    const id = getParam(req.params.id, 'id');
    const hackathon = await prisma.hackathon.findUnique({
      where: { id },
      include: {
        problems: {
          include: {
            question: true,
          },
        },
      },
    });
    if (!hackathon) {
      res.status(404).json(fail('Hackathon not found'));
      return;
    }
    res.json(ok(hackathon));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to get hackathon'));
  }
}

export async function registerHackathon(req: Request, res: Response): Promise<void> {
  try {
    const hackathonId = getParam(req.params.id, 'id');
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(fail(parsed.error.issues.map((issue) => issue.message).join(', ')));
      return;
    }

    const exists = await prisma.participant.findFirst({
      where: { hackathonId, userId: parsed.data.userId },
    });
    if (exists) {
      res.status(200).json(ok(exists, 'Already registered'));
      return;
    }

    const participant = await prisma.participant.create({
      data: {
        hackathonId,
        userId: parsed.data.userId,
        teamId: parsed.data.teamId ?? null,
      },
    });

    res.status(201).json(ok(participant, 'Registration successful'));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to register'));
  }
}

export async function getHackathonProblems(req: Request, res: Response): Promise<void> {
  try {
    const hackathonId = getParam(req.params.id, 'id');
    const problems = await prisma.problem.findMany({
      where: { hackathonId },
      include: {
        question: true,
      },
    });
    res.json(ok(problems));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to fetch problems'));
  }
}

export async function submitHackathonCode(req: Request, res: Response): Promise<void> {
  try {
    const hackathonId = getParam(req.params.id, 'id');
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(fail(parsed.error.issues.map((issue) => issue.message).join(', ')));
      return;
    }

    const judge = await queueJudge0Execution({
      sourceCode: parsed.data.code,
      languageId: parsed.data.languageId,
    });

    const submission = await prisma.submission.create({
      data: {
        problemId: parsed.data.problemId,
        userId: parsed.data.userId ?? null,
        teamId: parsed.data.teamId ?? null,
        language: parsed.data.language,
        code: parsed.data.code,
        status: judge.status,
        score: judge.status === 'ACCEPTED' ? 100 : 0,
        timeTaken: judge.timeTaken,
        memoryUsed: judge.memoryUsed,
      },
    });

    if (parsed.data.teamId || parsed.data.userId) {
      const existingEntry = await prisma.leaderboardEntry.findFirst({
        where: {
          hackathonId,
          teamId: parsed.data.teamId ?? null,
          userId: parsed.data.userId ?? null,
        },
      });

      if (existingEntry) {
        await prisma.leaderboardEntry.update({
          where: { id: existingEntry.id },
          data: {
            score: existingEntry.score + (judge.status === 'ACCEPTED' ? 100 : 0),
            solvedCount: existingEntry.solvedCount + (judge.status === 'ACCEPTED' ? 1 : 0),
            lastSubmit: new Date(),
          },
        });
      } else {
        await prisma.leaderboardEntry.create({
          data: {
            hackathonId,
            teamId: parsed.data.teamId ?? null,
            userId: parsed.data.userId ?? null,
            rank: 0,
            score: judge.status === 'ACCEPTED' ? 100 : 0,
            solvedCount: judge.status === 'ACCEPTED' ? 1 : 0,
            lastSubmit: new Date(),
          },
        });
      }
    }

    res.status(202).json(ok(submission, 'Submission evaluated'));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to submit code'));
  }
}

export async function getHackathonLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const hackathonId = getParam(req.params.id, 'id');
    const leaderboard = await prisma.leaderboardEntry.findMany({
      where: { hackathonId },
      orderBy: [{ score: 'desc' }, { lastSubmit: 'asc' }],
      take: 100,
    });

    const ranked = leaderboard.map((entry, index: number) => ({
      ...entry,
      rank: index + 1,
    }));
    res.json(ok(ranked));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to get leaderboard'));
  }
}

export async function getHackathonSubmissions(req: Request, res: Response): Promise<void> {
  try {
    const hackathonId = getParam(req.params.id, 'id');
    const submissions = await prisma.submission.findMany({
      where: {
        problem: {
          hackathonId,
        },
      },
      include: {
        problem: true,
      },
      orderBy: { submittedAt: 'desc' },
      take: 100,
    });
    res.json(ok(submissions));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to list submissions'));
  }
}
