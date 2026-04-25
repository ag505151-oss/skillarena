import { apiGet } from '@/lib/api';
import type { InterviewFeedback } from '@/types/interview';

interface InterviewResultPageProps {
  params: { id: string };
}

export default async function Page({ params }: InterviewResultPageProps): Promise<JSX.Element> {
  let feedback: InterviewFeedback | null = null;
  try {
    feedback = await apiGet<InterviewFeedback>(`/api/interviews/${params.id}/feedback`);
  } catch {
    feedback = null;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Interview Feedback</h1>
      {!feedback && <p className="text-sm text-zinc-500">Feedback not submitted yet.</p>}
      {feedback && (
        <div className="grid gap-2 rounded border p-4 text-sm md:grid-cols-2">
          <p>Problem Solving: {feedback.problemSolving}/5</p>
          <p>Communication: {feedback.communication}/5</p>
          <p>Code Quality: {feedback.codeQuality}/5</p>
          <p>Culture Fit: {feedback.cultureFit}/5</p>
          <p className="md:col-span-2">Comments: {feedback.comments ?? 'No comments'}</p>
        </div>
      )}
    </section>
  );
}
