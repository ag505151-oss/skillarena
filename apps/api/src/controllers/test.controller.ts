import type { Request, Response } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

import { prisma } from '@skillarena/db';

import { fail, ok } from '../utils/helpers';

const createTestSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.enum([
    'DSA',
    'SYSTEM_DESIGN',
    'BEHAVIOURAL',
    'HR',
    'APTITUDE',
    'LOGICAL',
    'VERBAL',
    'CODING',
    'DBMS',
    'OS',
    'NETWORKS',
    'ML',
  ]),
  duration: z.number().int().positive(),
  totalMarks: z.number().int().positive(),
  passingScore: z.number().int().nonnegative(),
});

const attemptSchema = z.object({
  userId: z.string().min(3),
});

const saveAttemptSchema = z.object({
  answers: z.array(
    z.object({
      testQuestionId: z.string().min(3),
      selectedOption: z.string().min(1).optional(),
      codeAnswer: z.string().optional(),
    }),
  ),
});

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unexpected error';
}

function computePercentile(rank: number, total: number): number {
  if (total <= 1) {
    return 100;
  }
  return Number((((total - rank) / (total - 1)) * 100).toFixed(2));
}

function requireParam(value: string | string[] | undefined, name: string): string {
  if (!value || Array.isArray(value)) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export async function listTests(_req: Request, res: Response): Promise<void> {
  try {
    const tests = await prisma.test.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        duration: true,
        totalMarks: true,
        passingScore: true,
        visibility: true,
      },
    });
    res.json(ok(tests));
  } catch (error: unknown) {
    res.status(500).json(fail(getErrorMessage(error)));
  }
}

export async function createTest(req: Request, res: Response): Promise<void> {
  try {
    const parsed = createTestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(fail(parsed.error.issues.map((issue) => issue.message).join(', ')));
      return;
    }

    const test = await prisma.test.create({
      data: parsed.data,
      select: { id: true, title: true },
    });
    res.status(201).json(ok(test, 'Test created'));
  } catch (error: unknown) {
    res.status(500).json(fail(getErrorMessage(error)));
  }
}

export async function getTestById(req: Request, res: Response): Promise<void> {
  try {
    const id = requireParam(req.params.id, 'id');
    const test = await prisma.test.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: true,
            options: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!test) {
      res.status(404).json(fail('Test not found'));
      return;
    }
    res.json(ok(test));
  } catch (error: unknown) {
    res.status(500).json(fail(getErrorMessage(error)));
  }
}

export async function startAttempt(req: Request, res: Response): Promise<void> {
  try {
    const parsed = attemptSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(fail(parsed.error.issues.map((issue) => issue.message).join(', ')));
      return;
    }

    const testId = requireParam(req.params.id, 'id');
    const test = await prisma.test.findUnique({ where: { id: testId } });
    if (!test) {
      res.status(404).json(fail('Test not found'));
      return;
    }

    const attempt = await prisma.attempt.create({
      data: {
        testId,
        userId: parsed.data.userId,
      },
      select: { id: true, testId: true, startedAt: true, status: true },
    });

    res.status(201).json(ok(attempt, 'Attempt started'));
  } catch (error: unknown) {
    res.status(500).json(fail(getErrorMessage(error)));
  }
}

export async function saveAttempt(req: Request, res: Response): Promise<void> {
  try {
    const parsed = saveAttemptSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(fail(parsed.error.issues.map((issue) => issue.message).join(', ')));
      return;
    }

    const attemptId = requireParam(req.params.attemptId, 'attemptId');
    const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
    if (!attempt) {
      res.status(404).json(fail('Attempt not found'));
      return;
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const answer of parsed.data.answers) {
        await tx.answer.upsert({
          where: {
            attemptId_testQuestionId: {
              attemptId,
              testQuestionId: answer.testQuestionId,
            },
          },
          create: {
            attemptId,
            testQuestionId: answer.testQuestionId,
            selectedOption: answer.selectedOption ?? null,
            codeAnswer: answer.codeAnswer ?? null,
          },
          update: {
            selectedOption: answer.selectedOption ?? null,
            codeAnswer: answer.codeAnswer ?? null,
          },
        });
      }
    });

    res.json(ok({ saved: true }, 'Attempt saved'));
  } catch (error: unknown) {
    res.status(500).json(fail(getErrorMessage(error)));
  }
}

export async function submitAttempt(req: Request, res: Response): Promise<void> {
  try {
    const { attemptId } = req.body as { attemptId?: string };
    if (!attemptId) {
      res.status(400).json(fail('attemptId is required'));
      return;
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: true,
        test: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      res.status(404).json(fail('Attempt not found'));
      return;
    }

    let score = 0;
    const questionMap = new Map(attempt.test.questions.map((question: typeof attempt.test.questions[number]) => [question.id, question]));

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const answer of attempt.answers) {
        const question = questionMap.get(answer.testQuestionId);
        if (!question) {
          continue;
        }

        const correctOption = question.options.find((option) => option.isCorrect);
        const isCorrect = Boolean(correctOption && answer.selectedOption === correctOption.id);
        const marksAwarded = isCorrect
          ? question.marks
          : -Math.max(0, Number(attempt.test.negativeMarks ?? 0));
        score += marksAwarded;

        await tx.answer.update({
          where: { id: answer.id },
          data: {
            isCorrect,
            marksAwarded,
          },
        });
      }

      await tx.attempt.update({
        where: { id: attempt.id },
        data: {
          score: Math.max(0, score),
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
      });
    });

    res.json(ok({ submitted: true, score: Math.max(0, score) }, 'Attempt submitted'));
  } catch (error: unknown) {
    res.status(500).json(fail(getErrorMessage(error)));
  }
}

export async function getResult(req: Request, res: Response): Promise<void> {
  try {
    const attemptId = requireParam(req.params.attemptId, 'attemptId');
    const testId = requireParam(req.params.id, 'id');
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        test: true,
        answers: {
          include: {
            testQuestion: {
              include: {
                question: true,
                options: true,
              },
            },
          },
        },
      },
    });
    if (!attempt) {
      res.status(404).json(fail('Result not found'));
      return;
    }
    if (attempt.testId !== testId) {
      res.status(404).json(fail('Result not found'));
      return;
    }

    const attempts = await prisma.attempt.findMany({
      where: { testId, status: { in: ['SUBMITTED', 'EVALUATED'] } },
      select: { id: true, score: true },
      orderBy: [{ score: 'desc' }, { submittedAt: 'asc' }],
    });
    const rank = attempts.findIndex((item: { id: string; score: number | null }) => item.id === attempt.id) + 1;
    const percentile = computePercentile(rank, attempts.length);

    res.json(
      ok({
        attempt,
        rank,
        percentile,
        passed: (attempt.score ?? 0) >= attempt.test.passingScore,
      }),
    );
  } catch (error: unknown) {
    res.status(500).json(fail(getErrorMessage(error)));
  }
}

export async function getTestLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const testId = requireParam(req.params.id, 'id');
    const leaderboard = await prisma.attempt.findMany({
      where: { testId, status: { in: ['SUBMITTED', 'EVALUATED'] } },
      select: {
        id: true,
        userId: true,
        score: true,
        timeTaken: true,
        submittedAt: true,
      },
      orderBy: [{ score: 'desc' }, { timeTaken: 'asc' }, { submittedAt: 'asc' }],
      take: 100,
    });
    res.json(ok(leaderboard));
  } catch (error: unknown) {
    res.status(500).json(fail(getErrorMessage(error)));
  }
}
