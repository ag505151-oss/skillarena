'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ExternalLink, CreditCard, Download, Loader2, Zap, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { UserData } from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

const mockHistory = [
  { date: '2025-04-01', plan: 'Pro Monthly', amount: '$30.00', status: 'Paid' },
  { date: '2025-03-01', plan: 'Pro Monthly', amount: '$30.00', status: 'Paid' },
];

interface Props { apiToken: string }

export function BillingPageClient({ apiToken }: Props) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/user/settings`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      const json = await res.json();
      if (json.success) setUserData(json.data);
    } catch {
      toast.error('Failed to load billing info');
    } finally {
      setLoading(false);
    }
  }, [apiToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch(`${API}/api/billing/portal`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      const json = await res.json();
      if (json.data?.url) window.open(json.data.url, '_blank');
      else toast.error('Could not open billing portal');
    } catch { toast.error('Failed to open billing portal'); }
    finally { setPortalLoading(false); }
  }

  async function cancelSubscription() {
    setCancelling(true);
    try {
      const res = await fetch(`${API}/api/billing/cancel-subscription`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('Subscription cancelled');
      setCancelDialog(false);
      fetchData();
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setCancelling(false); }
  }

  const plan = userData?.plan ?? 'FREE';

  const usage = {
    tests:      { used: 3, limit: 3 },
    interviews: { used: 0, limit: 1 },
    hackathons: { used: 1, limit: 1 },
  };

  if (loading) return <BillingSkeleton />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Billing &amp; Subscription</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your plan, usage, and payment details.</p>
      </motion.div>

      {/* Current plan */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#534AB7]" /> Current plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plan === 'FREE' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-sm px-3 py-1">Free</Badge>
                  <span className="text-sm text-muted-foreground">You're on the Free plan</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro to unlock unlimited tests, interviews, hackathons, and full analytics.
                </p>
                <Button variant="purple" asChild>
                  <Link href="/pricing">Upgrade to Pro — from $30/month</Link>
                </Button>
              </div>
            )}

            {plan === 'PRO' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="purple" className="text-sm px-3 py-1">Pro</Badge>
                    <div>
                      <p className="text-sm font-semibold">Pro Monthly</p>
                      <p className="text-xs text-muted-foreground">
                        Next renewal:{' '}
                        {userData?.planExpiresAt
                          ? new Date(userData.planExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          : 'N/A'}{' '}
                        · $30.00/month
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={openPortal} disabled={portalLoading}>
                    {portalLoading
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <ExternalLink className="h-4 w-4" />}
                    Manage billing
                  </Button>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <Link href="/pricing" className="text-[#534AB7] hover:underline">
                    Switch to annual and save 25%
                  </Link>
                  <button
                    onClick={() => setCancelDialog(true)}
                    className="text-[#E24B4A] hover:underline"
                  >
                    Cancel subscription
                  </button>
                </div>
              </div>
            )}

            {plan === 'LIFETIME' && (
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1D9E75]/10">
                  <CheckCircle className="h-6 w-6 text-[#1D9E75]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="teal" className="text-sm px-3 py-1">Lifetime</Badge>
                    <span className="text-sm font-semibold">Lifetime access — never expires</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">Thank you for your support ❤</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Usage (Free only) */}
      {plan === 'FREE' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Usage this month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {(Object.entries(usage) as [string, { used: number; limit: number }][]).map(([key, val]) => {
                const atLimit = val.used >= val.limit;
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium">{key}</span>
                      <span className={atLimit ? 'font-semibold text-[#E24B4A]' : 'text-muted-foreground'}>
                        {val.used} / {val.limit} used
                      </span>
                    </div>
                    <Progress
                      value={val.used}
                      max={val.limit}
                      barClassName={atLimit ? 'bg-[#E24B4A]' : 'bg-[#534AB7]'}
                    />
                  </div>
                );
              })}
              <Link href="/pricing" className="block text-sm text-[#534AB7] hover:underline">
                Upgrade for unlimited access →
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Payment method (Pro / Lifetime) */}
      {plan !== 'FREE' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment method</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-14 items-center justify-center rounded-lg border bg-muted">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/27</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={openPortal} disabled={portalLoading}>
                  Update
                </Button>
                <Button size="sm" variant="ghost" onClick={openPortal} disabled={portalLoading}>
                  Add backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Billing history */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Billing history</CardTitle>
          </CardHeader>
          <CardContent>
            {plan === 'FREE' ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No billing history yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {['Date', 'Plan', 'Amount', 'Status', 'Invoice'].map((h) => (
                        <th key={h} className="pb-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockHistory.map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 text-muted-foreground">{row.date}</td>
                        <td className="py-3 font-medium">{row.plan}</td>
                        <td className="py-3">{row.amount}</td>
                        <td className="py-3">
                          <Badge variant="teal">{row.status}</Badge>
                        </td>
                        <td className="py-3">
                          <button className="flex items-center gap-1 text-xs text-[#534AB7] hover:underline">
                            <Download className="h-3 w-3" /> PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Cancel dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} title="Cancel subscription">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your Pro access will remain active until the end of the current billing period. After that, your account reverts to the Free plan.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setCancelDialog(false)}>Keep subscription</Button>
            <Button variant="destructive" onClick={cancelSubscription} disabled={cancelling}>
              {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel subscription'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function BillingSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-5">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}
