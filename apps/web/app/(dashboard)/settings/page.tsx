import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { SettingsClient } from '@/components/settings/SettingsClient';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return (
    <SettingsClient
      apiToken={(session as { apiToken?: string }).apiToken ?? ''}
      userEmail={session.user?.email ?? ''}
      userName={session.user?.name ?? ''}
    />
  );
}
