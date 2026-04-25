export interface InterviewListItem {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  roomId: string;
  candidate: { id: string; name: string; email: string };
  interviewer: { id: string; name: string; email: string };
}

export interface InterviewFeedback {
  problemSolving: number;
  communication: number;
  codeQuality: number;
  cultureFit: number;
  comments?: string | null;
}
