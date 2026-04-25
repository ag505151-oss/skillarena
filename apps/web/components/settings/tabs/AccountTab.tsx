'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Check, Loader2, Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

import type { UserData } from '@/types/settings';

interface Props { userData: UserData | null; apiToken: string; onDirty: (v: boolean) => void; onSaved: () => void }

function passwordStrength(pw: string): { label: string; color: string; width: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  const map: { label: string; color: string; width: string }[] = [
    { label: '', color: 'bg-muted', width: '0%' },
    { label: 'Weak', color: 'bg-[#E24B4A]', width: '25%' },
    { label: 'Fair', color: 'bg-[#EF9F27]', width: '50%' },
    { label: 'Strong', color: 'bg-blue-500', width: '75%' },
    { label: 'Very Strong', color: 'bg-[#1D9E75]', width: '100%' },
  ];
  return map[score] ?? map[0]!;
}

export function AccountTab({ userData, apiToken, onDirty: _onDirty, onSaved: _onSaved }: Props) {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const [pw, setPw] = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [sessions] = useState([
    { id: '1', device: 'MacBook Pro', browser: 'Chrome 124', location: 'San Francisco, CA', lastActive: '2 minutes ago', isCurrent: true },
    { id: '2', device: 'iPhone 15', browser: 'Safari 17', location: 'New York, NY', lastActive: '3 hours ago', isCurrent: false },
  ]);

  const strength = passwordStrength(pw.new);
  const pwRequirements = [
    { label: 'At least 8 characters', met: pw.new.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(pw.new) },
    { label: 'One number', met: /[0-9]/.test(pw.new) },
    { label: 'One special character', met: /[^a-zA-Z0-9]/.test(pw.new) },
  ];
  const pwValid = pwRequirements.every((r) => r.met) && pw.new === pw.confirm;

  async function handleChangeEmail() {
    try {
      const res = await fetch(`${API}/api/user/email`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
        body: JSON.stringify({ newEmail, currentPassword: emailPassword }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setEmailSent(true);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  }

  async function handleChangePassword() {
    setSavingPw(true);
    try {
      const res = await fetch(`${API}/api/user/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.new, confirmPassword: pw.confirm }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('Password updated');
      setPw({ current: '', new: '', confirm: '' });
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setSavingPw(false); }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE MY ACCOUNT') return;
    setDeleting(true);
    try {
      await fetch(`${API}/api/user/account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
        body: JSON.stringify({ confirmation: deleteConfirm }),
      });
      window.location.href = '/';
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed'); setDeleting(false); }
  }

  return (
    <div className="space-y-5">
      {/* Personal info */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Personal information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <div className="flex items-center gap-2">
                <input value={userData?.email ?? ''} readOnly className="input flex-1 bg-muted/50 cursor-not-allowed" />
                <Button size="sm" variant="outline" onClick={() => setShowEmailDialog(true)}>Change</Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone number</label>
              <input defaultValue={userData?.phone ?? ''} className="input" placeholder="+1 (555) 000-0000" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date of birth</label>
              <input type="date" defaultValue={userData?.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : ''}
                className="input" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Change password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {(['current', 'new', 'confirm'] as const).map((field) => (
            <div key={field} className="space-y-1.5">
              <label className="text-sm font-medium capitalize">
                {field === 'current' ? 'Current password' : field === 'new' ? 'New password' : 'Confirm new password'}
              </label>
              <div className="relative">
                <input
                  type={showPw[field] ? 'text' : 'password'}
                  value={pw[field]}
                  onChange={(e) => setPw((p) => ({ ...p, [field]: e.target.value }))}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw((s) => ({ ...s, [field]: !s[field] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {field === 'new' && pw.new && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: strength.color === 'bg-muted' ? undefined : undefined }}>{strength.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {pwRequirements.map((req) => (
                      <div key={req.label} className={`flex items-center gap-1.5 text-xs ${req.met ? 'text-[#1D9E75]' : 'text-muted-foreground'}`}>
                        <Check className={`h-3 w-3 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {field === 'confirm' && pw.confirm && (
                <p className={`text-xs ${pw.new === pw.confirm ? 'text-[#1D9E75]' : 'text-[#E24B4A]'}`}>
                  {pw.new === pw.confirm ? '✓ Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>
          ))}
          <Button variant="purple" disabled={!pwValid || savingPw} onClick={handleChangePassword}>
            {savingPw ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</> : 'Update password'}
          </Button>
        </CardContent>
      </Card>

      {/* Connected accounts */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Connected accounts</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: 'Google', icon: '🔵', connected: userData?.provider === 'google' },
            { name: 'GitHub', icon: '⚫', connected: userData?.provider === 'github' },
          ].map((acc) => (
            <div key={acc.name} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{acc.icon}</span>
                <span className="text-sm font-medium">{acc.name}</span>
              </div>
              {acc.connected ? (
                <div className="flex items-center gap-2">
                  <Badge variant="teal">Connected</Badge>
                  <button className="text-xs text-muted-foreground hover:text-destructive transition-colors">Disconnect</button>
                </div>
              ) : (
                <Button size="sm" variant="outline">Connect</Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Active sessions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Active sessions</CardTitle>
            <button className="text-xs text-[#E24B4A] hover:underline">Revoke all other sessions</button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className={`flex items-center justify-between rounded-lg border p-3 ${s.isCurrent ? 'border-[#534AB7]/30 bg-[#534AB7]/5' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  {s.device.includes('iPhone') ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {s.device}
                    {s.isCurrent && <Badge variant="purple" className="text-[10px] px-1.5 py-0">This device</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.browser} · {s.location} · {s.lastActive}</div>
                </div>
              </div>
              {!s.isCurrent && (
                <button className="text-xs text-[#E24B4A] hover:underline">Revoke</button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-[#E24B4A]/30">
        <CardHeader className="pb-3"><CardTitle className="text-base text-[#E24B4A]">Danger zone</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Export my data</p>
              <p className="text-xs text-muted-foreground">Download all your data as JSON</p>
            </div>
            <Button size="sm" variant="outline" onClick={async () => {
              const res = await fetch(`${API}/api/user/export`, { headers: { Authorization: `Bearer ${apiToken}` } });
              const json = await res.json();
              const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'skillarena-data.json'; a.click();
            }}>Export</Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#E24B4A]/20 p-3">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button size="sm" variant="destructive" onClick={() => setShowDeleteDialog(true)}>Delete account</Button>
          </div>
        </CardContent>
      </Card>

      {/* Change email dialog */}
      <Dialog open={showEmailDialog} onClose={() => { setShowEmailDialog(false); setEmailSent(false); }} title="Change email">
        {emailSent ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1D9E75]/10">
              <Check className="h-6 w-6 text-[#1D9E75]" />
            </div>
            <p className="text-sm font-medium">Verification email sent to {newEmail}</p>
            <p className="mt-1 text-xs text-muted-foreground">Click the link to confirm your new email address.</p>
            <Button className="mt-4" variant="outline" onClick={() => { setShowEmailDialog(false); setEmailSent(false); }}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">New email address</label>
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="input" type="email" placeholder="new@email.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Current password</label>
              <input value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} className="input" type="password" placeholder="••••••••" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>Cancel</Button>
              <Button variant="purple" onClick={handleChangeEmail} disabled={!newEmail || !emailPassword}>Send verification</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete account dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} title="Delete account" className="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">This action is <strong>irreversible</strong>. All your data will be permanently deleted.</p>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Type <code className="rounded bg-muted px-1 text-xs">DELETE MY ACCOUNT</code> to confirm</label>
            <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} className="input" placeholder="DELETE MY ACCOUNT" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteConfirm !== 'DELETE MY ACCOUNT' || deleting} onClick={handleDeleteAccount}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete permanently'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
