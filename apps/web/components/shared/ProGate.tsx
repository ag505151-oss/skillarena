'use client';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProGateProps {
  children: React.ReactNode;
  feature: string;
  plan?: string;
  blur?: boolean;
}

export function ProGate({ children, feature, plan = 'FREE', blur = true }: ProGateProps) {
  if (plan === 'PRO' || plan === 'LIFETIME') return <>{children}</>;

  return (
    <div className="relative">
      {blur && <div className="pointer-events-none select-none blur-sm">{children}</div>}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="mx-4 rounded-xl border bg-card p-6 shadow-xl text-center max-w-sm w-full">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#534AB7]/10">
            <Lock className="h-6 w-6 text-[#534AB7]" />
          </div>
          <h3 className="text-lg font-semibold">This feature requires Pro</h3>
          <p className="mt-1 text-sm text-muted-foreground">{feature}</p>
          <ul className="mt-3 space-y-1 text-sm text-left text-muted-foreground">
            {['Unlimited tests', 'Full analytics', 'Certificate downloads', 'Interview access'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-[#1D9E75]">✓</span> {item}
              </li>
            ))}
          </ul>
          <Button asChild className="mt-4 w-full" variant="purple">
            <Link href="/pricing">Upgrade from $30/mo</Link>
          </Button>
          <Link href="/pricing" className="mt-2 block text-xs text-muted-foreground hover:underline">
            Or get lifetime access for $300
          </Link>
        </div>
      </div>
    </div>
  );
}
