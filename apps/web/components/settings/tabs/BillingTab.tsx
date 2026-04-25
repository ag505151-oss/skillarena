'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, CreditCard, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog } from '@/components/ui/dialog';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

import type { UserData } from '@/types/settings';

interface Props { userData: UserData | null; apiToken: string };

const mockHistory = [
  { date: '2025-04-01', plan: 'Pro Monthly', amount: '$30.00', status: 'Paid' },
  { date: '2025-03-01', plan: 'Pro Monthly', amount: '$30.00', status: 'Paid' },
];

export function BillingTab({ userData, apiToken }: Props) {
  const plan = userData?.plan ?? 'FREE';
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const usage = {
    tests: { used: 3, limit: 3 },
    interviews: { used: 0, limit: 1 },
    hackathons: { used: 1, limit: 1 },
  };

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch(`${API}/api/billing/portal`, { headers: { Authorization: `Bearer ${apiToken}` } });
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
        method: 'POST', headers: { Authorization: `Bearer ${apiToken}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('Subscription cancelled');
      setCancelDialog(false);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setCancelling(false); }
  }

  return (
    <div className="space-y-5">
      {/* Current plan */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Current plan</CardTitle></CardHeader>
        <CardContent>
          {plan === 'FREE' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm px-3 py-1">Free</Badge>
                <span className="text-sm text-muted-foreground">You're on the Free plan</span>
              </div>
              <Button variant="purple" asChild>
                <Link href="/pricing">Upgrade to Pro — from $30/month</Link>
              </Button>
            </div>
          )}
          {plan === 'PRO' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="purple" className="text-sm px-3 py-1">Pro</Badge>
                  <div>
                    <p className="text-sm font-medium">Pro Monthly</p>
                    <p className="text-xs text-muted-foreground">
                      Next renewal: {userData?.planExpiresAt ? new Date(userData.planExpiresAt).toLocaleDateString() : 'N/A'} · $30.00/month
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={openPortal} disabled={portalLoading}>
                  {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  Manage
                </Button>
              </div>
              <div className="flex gap-3 text-sm">
                <Link href="/pricing" className="text-[#534AB7] hover:underline">Switch to annual and save 25%</Link>
                <span className="text-muted-foreground">·</span>
                <button onClick={() => setCancelDialog(true)} className="text-[#E24B4A] hover:underline">Cancel subscription</button>
              </div>
            </div>
          )}
          {plan === 'LIFETIME' && (
            <div className="flex items-center gap-3">
              <Badge variant="teal" className="text-sm px-3 py-1">Lifetime</Badge>
              <div>
                <p className="text-sm font-medium">Lifetime access — never expires</p>
                <p className="text-xs text-muted-foreground">Thank you for your support ❤</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage (Free only) */}
      {plan === 'FREE' && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Usage this month</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(usage).map(([key, val]) => (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize font-medium">{key}</span>
                  <span className={val.used >= val.limit ? 'text-[#E24B4A] font-semibold' : 'text-muted-foreground'}>
                    {val.used}/{val.limit} used
                  </span>
                </div>
                <Progress
                  value={val.used}
                  max={val.limit}
                  barClassName={val.used >= val.limit ? 'bg-[#E24B4A]' : 'bg-[#534AB7]'}
                />
              </div>
            ))}
            <Link href="/pricing" className="text-sm text-[#534AB7] hover:underline">
              Upgrade for unlimited access →
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Billing history */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Billing history</CardTitle></CardHeader>
        <CardContent>
          {plan === 'FREE' || mockHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No billing history yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    {['Date', 'Plan', 'Amount', 'Status', 'Invoice'].map((h) => (
                      <th key={h} className="pb-2 text-left font-medium">{h}</th>
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
                        <button className="flex items-center gap-1 text-[#534AB7] hover:underline text-xs">
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

      {/* Payment method (Pro/Lifetime) */}
      {plan !== 'FREE' && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Payment method</CardTitle></CardHeader>
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
            <Button size="sm" variant="outline" onClick={openPortal}>Update</Button>
          </CardContent>
        </Card>
      )}

      {/* Cancel dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} title="Cancel subscription">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your Pro access will remain active until the end of the current billing period. After that, your account will revert to the Free plan.
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
