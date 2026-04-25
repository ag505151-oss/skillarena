import type { Request, Response } from 'express';
import { z } from 'zod';

import { prisma } from '@skillarena/db';

import { fail, ok } from '../utils/helpers';

const createInterviewSchema = z.object({
  title: z.string().min(3),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().min(15).max(180),
  candidateId: z.string().min(3),
  interviewerId: z.string().min(3),
});

const updateInterviewSchema = z.object({
  title: z.string().min(3).optional(),
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().int().min(15).max(180).optional(),
  status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
});

const feedbackSchema = z.object({
  authorId: z.string().min(3),
  problemSolving: z.number().int().min(1).max(5),
  communication: z.number().int().min(1).max(5),
  codeQuality: z.number().int().min(1).max(5),
  cultureFit: z.number().int().min(1).max(5),
  comments: z.string().optional(),
});

function getParam(value: string | string[] | undefined, name: string): string {
  if (!value || Array.isArray(value)) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export async function listInterviews(_req: Request, res: Response): Promise<void> {
  try {
    const interviews = await prisma.interview.findMany({
      orderBy: { scheduledAt: 'desc' },
      include: {
        candidate: {
          select: { id: true, name: true, email: true },
        },
        interviewer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    res.json(ok(interviews));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to list interviews'));
  }
}

export async function createInterview(req: Request, res: Response): Promise<void> {
  try {
    const parsed = createInterviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(fail(parsed.error.issues.map((issue) => issue.message).join(', ')));
      return;
    }

    const roomId = `room-${crypto.randomUUID()}`;
    const interview = await prisma.interview.create({
      data: {
        title: parsed.data.title,
        scheduledAt: new Date(parsed.data.scheduledAt),
        duration: parsed.data.duration,
        candidateId: parsed.data.candidateId,
        interviewerId: parsed.data.interviewerId,
        roomId,
      },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        interviewer: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.notification.createMany({
      data: [
        {
          userId: parsed.data.candidateId,
          title: 'Interview Scheduled',
          message: `Your interview "${parsed.data.title}" is scheduled.`,
          type: 'INTERVIEW',
          link: `/interviews/${interview.id}`,
        },
        {
          userId: parsed.data.interviewerId,
          title: 'Interview Assigned',
          message: `You have been assigned to interview "${parsed.data.title}".`,
          type: 'INTERVIEW',
          link: `/interviews/${interview.id}`,
        },
      ],
    });

    res.status(201).json(ok(interview, 'Interview scheduled'));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to create interview'));
  }
}

export async function getInterviewById(req: Request, res: Response): Promise<void> {
  try {
    const id = getParam(req.params.id, 'id');
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        interviewer: { select: { id: true, name: true, email: true } },
        feedback: true,
      },
    });

    if (!interview) {
      res.status(404).json(fail('Interview not found'));
      return;
    }
    res.json(ok(interview));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to get interview'));
  }
}

export async function updateInterview(req: Request, res: Response): Promise<void> {
  try {
    const id = getParam(req.params.id, 'id');
    const parsed = updateInterviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(fail(parsed.error.issues.map((issue) => issue.message).join(', ')));
      return;
    }

    const updateData: {
      title?: string;
      scheduledAt?: Date;
      duration?: number;
      status?: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
      notes?: string;
    } = {};
    if (parsed.data.title !== undefined) {
      updateData.title = parsed.data.title;
    }
    if (parsed.data.scheduledAt !== undefined) {
      updateData.scheduledAt = new Date(parsed.data.scheduledAt);
    }
    if (parsed.data.duration !== undefined) {
      updateData.duration = parsed.data.duration;
    }
    if (parsed.data.status !== undefined) {
      updateData.status = parsed.data.status;
    }
    if (parsed.data.notes !== undefined) {
      updateData.notes = parsed.data.notes;
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: updateData,
    });
    res.json(ok(updated, 'Interview updated'));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to update interview'));
  }
}

export async function deleteInterview(req: Request, res: Response): Promise<void> {
  try {
    const id = getParam(req.params.id, 'id');
    await prisma.interview.delete({ where: { id } });
    res.json(ok({ deleted: true }, 'Interview deleted'));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to delete interview'));
  }
}

export async function submitInterviewFeedback(req: Request, res: Response): Promise<void> {
  try {
    const interviewId = getParam(req.params.id, 'id');
    const parsed = feedbackSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(fail(parsed.error.issues.map((issue) => issue.message).join(', ')));
      return;
    }

    const feedbackCreateData = {
      interviewId,
      authorId: parsed.data.authorId,
      problemSolving: parsed.data.problemSolving,
      communication: parsed.data.communication,
      codeQuality: parsed.data.codeQuality,
      cultureFit: parsed.data.cultureFit,
      comments: parsed.data.comments ?? null,
    };
    const feedbackUpdateData = {
      authorId: parsed.data.authorId,
      problemSolving: parsed.data.problemSolving,
      communication: parsed.data.communication,
      codeQuality: parsed.data.codeQuality,
      cultureFit: parsed.data.cultureFit,
      comments: parsed.data.comments ?? null,
    };

    const feedback = await prisma.feedback.upsert({
      where: { interviewId },
      create: feedbackCreateData,
      update: feedbackUpdateData,
    });

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      select: { candidateId: true },
    });
    if (interview) {
      await prisma.notification.create({
        data: {
          userId: interview.candidateId,
          title: 'Interview Feedback Published',
          message: 'Your interview feedback is now available.',
          type: 'INTERVIEW',
          link: `/interviews/${interviewId}/result`,
        },
      });
    }

    res.status(201).json(ok(feedback, 'Feedback submitted'));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to submit feedback'));
  }
}

export async function getInterviewFeedback(req: Request, res: Response): Promise<void> {
  try {
    const interviewId = getParam(req.params.id, 'id');
    const feedback = await prisma.feedback.findUnique({
      where: { interviewId },
    });
    if (!feedback) {
      res.status(404).json(fail('Feedback not found'));
      return;
    }
    res.json(ok(feedback));
  } catch (error: unknown) {
    res.status(500).json(fail(error instanceof Error ? error.message : 'Failed to get feedback'));
  }
}
