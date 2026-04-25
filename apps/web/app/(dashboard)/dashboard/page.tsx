import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <DashboardClient
      userName={session.user?.name ?? 'there'}
      userRole={session.user?.role ?? 'CANDIDATE'}
      userPlan={(session as { plan?: string }).plan ?? 'FREE'}
    />
  );
}
