'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

const EMAIL_GROUPS = [
  {
    label: 'Interviews',
    items: [
      { key: 'email_interview_scheduled', label: 'Interview scheduled confirmation' },
      { key: 'email_interview_reminder_24h', label: 'Reminder 24 hours before interview' },
      { key: 'email_interview_reminder_1h', label: 'Reminder 1 hour before interview' },
      { key: 'email_interview_feedback', label: 'Interview feedback submitted' },
    ],
  },
  {
    label: 'Hackathons',
    items: [
      { key: 'email_hackathon_registered', label: 'Registration confirmation' },
      { key: 'email_hackathon_starting', label: 'Hackathon starting in 1 hour' },
      { key: 'email_hackathon_results', label: 'Results and leaderboard published' },
      { key: 'email_hackathon_certificate', label: 'Certificate ready to download' },
    ],
  },
  {
    label: 'Tests',
    items: [
      { key: 'email_test_result', label: 'Test result evaluated' },
      { key: 'email_test_new', label: 'New test added in your skill area' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { key: 'email_weekly_digest', label: 'Weekly performance digest' },
      { key: 'email_announcements', label: 'New feature announcements' },
      { key: 'email_tips', label: 'Tips and learning resources' },
    ],
  },
];

const INAPP_GROUPS = EMAIL_GROUPS.map((g) => ({
  ...g,
  items: g.items.map((item) => ({ ...item, key: item.key.replace('email_', 'inapp_') })),
}));

type Prefs = Record<string, boolean>;

function buildDefaults(): Prefs {
  const prefs: Prefs = {};
  [...EMAIL_GROUPS, ...INAPP_GROUPS].forEach((g) => g.items.forEach((item) => { prefs[item.key] = true; }));
  prefs['digest_frequency'] = true;
  return prefs;
}

import type { UserData } from '@/types/settings';

interface Props { userData: UserData | null; apiToken: string; onSaved: () => void }

export function NotificationsTab({ userData, apiToken, onSaved }: Props) {
  const stored = (userData?.notificationPrefs ?? {}) as Prefs;
  const defaults = buildDefaults();
  const [prefs, setPrefs] = useState<Prefs>({ ...defaults, ...stored });
  const [digest, setDigest] = useState<'immediately' | 'daily' | 'weekly'>(() => {
    const freq = stored['digest_frequency'];
    if (freq === 'daily' || freq === 'weekly') return freq;
    return 'immediately';
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(key: string) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/user/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
        body: JSON.stringify({ notificationPrefs: { ...prefs, digest_frequency: digest } }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSaved();
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-5">
      {/* Email notifications */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Email notifications</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {EMAIL_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</p>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <label className="text-sm cursor-pointer" htmlFor={item.key}>{item.label}</label>
                    <Switch
                      checked={prefs[item.key] ?? true}
                      onCheckedChange={() => toggle(item.key)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* In-app notifications */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">In-app notifications</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {INAPP_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</p>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <label className="text-sm cursor-pointer">{item.label}</label>
                    <Switch
                      checked={prefs[item.key] ?? true}
                      onCheckedChange={() => toggle(item.key)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Digest frequency */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Notification frequency</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">How often should we send digest emails?</p>
          <div className="space-y-2">
            {([
              { value: 'immediately', label: 'Immediately', desc: 'Get notified as events happen' },
              { value: 'daily', label: 'Daily summary', desc: 'One email per day with all updates' },
              { value: 'weekly', label: 'Weekly summary', desc: 'One email per week with highlights' },
            ] as const).map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                <input type="radio" name="digest" value={opt.value} checked={digest === opt.value}
                  onChange={() => setDigest(opt.value)} className="mt-0.5 accent-[#534AB7]" />
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="purple" onClick={handleSave} disabled={saving}>
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
          ) : saved ? (
            <><Check className="h-4 w-4" /> Saved</>
          ) : (
            'Save preferences'
          )}
        </Button>
      </div>
    </div>
  );
}
