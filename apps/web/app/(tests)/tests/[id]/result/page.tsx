import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiGet } from '@/lib/api';
import { TestResultClient } from '@/components/tests/TestResultClient';
import type { TestResult } from '@/components/tests/TestResultClient';

export const metadata: Metadata = { title: 'Test Result' };

interface Props { params: { id: string }; searchParams: { attemptId?: string } }

export default async function TestResultPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const attemptId = searchParams.attemptId ?? '';
  const plan = (session as { plan?: string })?.plan ?? 'FREE';

  let result: TestResult | null = null;
  try {
    result = await apiGet<TestResult>(`/api/tests/${params.id}/result/${attemptId}`);
  } catch (_e) {
    // result stays null
  }

  return <TestResultClient result={result} plan={plan} testId={params.id} />;
}
