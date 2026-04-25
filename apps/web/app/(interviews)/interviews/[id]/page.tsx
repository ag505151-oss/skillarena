import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { InterviewRoomClient } from '@/components/interviews/InterviewRoomClient';

export const metadata: Metadata = { title: 'Interview Room' };

export default async function InterviewRoomPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? 'CANDIDATE';
  return <InterviewRoomClient interviewId={params.id} userRole={role} />;
}
