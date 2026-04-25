import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { BillingPageClient } from '@/components/billing/BillingPageClient';

export const metadata: Metadata = { title: 'Billing & Subscription' };

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return (
    <BillingPageClient
      apiToken={(session as { apiToken?: string }).apiToken ?? ''}
    />
  );
}
