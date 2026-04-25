import { Router } from 'express';

import {
  createInterview,
  deleteInterview,
  getInterviewById,
  getInterviewFeedback,
  listInterviews,
  submitInterviewFeedback,
  updateInterview,
} from '../controllers/interview.controller';

export const interviewRouter = Router();

interviewRouter.get('/', listInterviews);
interviewRouter.post('/', createInterview);
interviewRouter.get('/:id', getInterviewById);
interviewRouter.patch('/:id', updateInterview);
interviewRouter.delete('/:id', deleteInterview);
interviewRouter.post('/:id/feedback', submitInterviewFeedback);
interviewRouter.get('/:id/feedback', getInterviewFeedback);
