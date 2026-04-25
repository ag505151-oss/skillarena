'use client';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Upload, X, FileText, Eye, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog } from '@/components/ui/dialog';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';
const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'skillarena';

const SKILL_SUGGESTIONS = ['React', 'TypeScript', 'Python', 'Node.js', 'DSA', 'System Design',
  'Java', 'C++', 'Go', 'Rust', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'GraphQL'];

import type { UserData } from '@/types/settings';

interface Props { userData: UserData | null; apiToken: string; onDirty: (v: boolean) => void; onSaved: () => void }

export function ProfileTab({ userData, apiToken, onDirty, onSaved }: Props) {
  const [form, setForm] = useState({
    name: userData?.name ?? '',
    username: userData?.username ?? '',
    bio: userData?.bio ?? '',
    location: userData?.location ?? '',
    website: userData?.website ?? '',
    githubUrl: userData?.githubUrl ?? '',
    linkedinUrl: userData?.linkedinUrl ?? '',
    twitterHandle: userData?.twitterHandle ?? '',
    skills: (userData?.skills ?? []) as string[],
  });
  const [saving, setSaving] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [resumeProgress, setResumeProgress] = useState(0);
  const [skillInput, setSkillInput] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [confirmRemoveResume, setConfirmRemoveResume] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);

  const initials = form.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const filteredSuggestions = SKILL_SUGGESTIONS.filter(
    (s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !form.skills.includes(s)
  );

  function set(field: string, value: string | string[]) {
    setForm((f) => ({ ...f, [field]: value }));
    onDirty(true);
  }

  async function uploadToCloudinary(file: File, type: 'avatar' | 'resume', onProgress: (p: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    formData.append('folder', `skillarena/${type}`);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        if (data.secure_url) resolve(data.secure_url);
        else reject(new Error('Upload failed'));
      };
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD || 'demo'}/upload`);
      xhr.send(formData);
    });
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Max file size is 2MB'); return; }
    if (!['image/jpeg', 'image/png'].includes(file.type)) { toast.error('Only JPG/PNG allowed'); return; }
    try {
      setAvatarProgress(1);
      const url = await uploadToCloudinary(file, 'avatar', setAvatarProgress);
      await fetch(`${API}/api/user/avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
        body: JSON.stringify({ url }),
      });
      toast.success('Avatar updated');
      onSaved();
    } catch { toast.error('Avatar upload failed'); }
    finally { setAvatarProgress(0); }
  }

  async function handleRemoveAvatar() {
    await fetch(`${API}/api/user/avatar`, { method: 'DELETE', headers: { Authorization: `Bearer ${apiToken}` } });
    toast.success('Avatar removed');
    onSaved();
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max file size is 5MB'); return; }
    if (file.type !== 'application/pdf') { toast.error('Only PDF files allowed'); return; }
    try {
      setResumeProgress(1);
      const url = await uploadToCloudinary(file, 'resume', setResumeProgress);
      await fetch(`${API}/api/user/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
        body: JSON.stringify({ url, filename: file.name }),
      });
      toast.success('Resume uploaded');
      onSaved();
    } catch { toast.error('Resume upload failed'); }
    finally { setResumeProgress(0); }
  }

  async function handleRemoveResume() {
    await fetch(`${API}/api/user/resume`, { method: 'DELETE', headers: { Authorization: `Bearer ${apiToken}` } });
    toast.success('Resume removed');
    setConfirmRemoveResume(false);
    onSaved();
  }

  function addSkill(skill: string) {
    const s = skill.trim();
    if (!s || form.skills.includes(s) || form.skills.length >= 20) return;
    set('skills', [...form.skills, s]);
    setSkillInput('');
    setShowSkillSuggestions(false);
  }

  function removeSkill(skill: string) {
    set('skills', form.skills.filter((s: string) => s !== skill));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/user/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('Profile saved');
      onDirty(false);
      onSaved();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Avatar */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Profile photo</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-5">
          <div className="relative">
            {userData?.avatar ? (
              <img src={userData.avatar} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#534AB7] text-white text-2xl font-bold">
                {initials}
              </div>
            )}
            {avatarProgress > 0 && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <span className="text-white text-xs font-bold">{avatarProgress}%</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input ref={avatarRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleAvatarUpload} />
            <Button size="sm" variant="outline" onClick={() => avatarRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" /> Upload photo
            </Button>
            {userData?.avatar && (
              <button onClick={handleRemoveAvatar} className="block text-xs text-muted-foreground hover:text-destructive transition-colors">
                Remove photo
              </button>
            )}
            <p className="text-xs text-muted-foreground">JPG or PNG, max 2MB</p>
          </div>
          {avatarProgress > 0 && <Progress value={avatarProgress} className="flex-1 h-1.5" />}
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Profile information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name">
              <input value={form.name} onChange={(e) => set('name', e.target.value)}
                className="input" placeholder="Your full name" maxLength={50} />
            </Field>
            <Field label="Username">
              <div className="relative">
                <input value={form.username} onChange={(e) => set('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                  className="input pl-7" placeholder="username" maxLength={20} />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
              </div>
              {form.username && (
                <p className="mt-1 text-xs text-muted-foreground">Preview: @{form.username}</p>
              )}
            </Field>
          </div>

          <Field label={`Bio (${form.bio.length}/200)`}>
            <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)}
              className="input min-h-[80px] resize-none" placeholder="Tell us about yourself" maxLength={200} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location">
              <input value={form.location} onChange={(e) => set('location', e.target.value)}
                className="input" placeholder="San Francisco, CA" maxLength={100} />
            </Field>
            <Field label="Website">
              <input value={form.website} onChange={(e) => set('website', e.target.value)}
                className="input" placeholder="https://yoursite.com" type="url" />
            </Field>
            <Field label="GitHub">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">github.com/</span>
                <input value={form.githubUrl.replace('https://github.com/', '')}
                  onChange={(e) => set('githubUrl', e.target.value ? `https://github.com/${e.target.value}` : '')}
                  className="input pl-24" placeholder="username" />
              </div>
            </Field>
            <Field label="LinkedIn">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">linkedin.com/in/</span>
                <input value={form.linkedinUrl.replace('https://linkedin.com/in/', '')}
                  onChange={(e) => set('linkedinUrl', e.target.value ? `https://linkedin.com/in/${e.target.value}` : '')}
                  className="input pl-28" placeholder="username" />
              </div>
            </Field>
            <Field label="Twitter / X">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <input value={form.twitterHandle} onChange={(e) => set('twitterHandle', e.target.value.replace('@', ''))}
                  className="input pl-7" placeholder="handle" />
              </div>
            </Field>
          </div>

          {/* Skills tag input */}
          <Field label={`Skills (${form.skills.length}/20)`}>
            <div className="rounded-lg border bg-background p-2 min-h-[44px] flex flex-wrap gap-1.5">
              {form.skills.map((skill: string) => (
                <span key={skill} className="flex items-center gap-1 rounded-full bg-[#534AB7]/10 px-2.5 py-0.5 text-xs font-medium text-[#534AB7]">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                </span>
              ))}
              <div className="relative">
                <input
                  value={skillInput}
                  onChange={(e) => { setSkillInput(e.target.value); setShowSkillSuggestions(true); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
                  onFocus={() => setShowSkillSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 150)}
                  placeholder={form.skills.length < 20 ? 'Add skill...' : ''}
                  disabled={form.skills.length >= 20}
                  className="border-0 bg-transparent text-xs outline-none placeholder:text-muted-foreground min-w-[100px]"
                />
                {showSkillSuggestions && skillInput && filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border bg-card shadow-lg py-1">
                    {filteredSuggestions.slice(0, 6).map((s) => (
                      <button key={s} onMouseDown={() => addSkill(s)}
                        className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Press Enter to add a skill</p>
          </Field>
        </CardContent>
      </Card>

      {/* Resume */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Resume / CV</CardTitle></CardHeader>
        <CardContent>
          <input ref={resumeRef} type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} />
          {userData?.resumeUrl ? (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E24B4A]/10">
                  <FileText className="h-5 w-5 text-[#E24B4A]" />
                </div>
                <div>
                  <p className="text-sm font-medium">resume.pdf</p>
                  {userData.resumeUploadedAt && (
                    <p className="text-xs text-muted-foreground">
                      Uploaded {new Date(userData.resumeUploadedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => window.open(userData?.resumeUrl ?? '', '_blank')}>
                  <Eye className="h-3.5 w-3.5" /> Preview
                </Button>
                <Button size="sm" variant="outline" onClick={() => resumeRef.current?.click()}>Replace</Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"
                  onClick={() => setConfirmRemoveResume(true)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => resumeRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center hover:border-[#534AB7]/50 hover:bg-[#534AB7]/5 transition-colors"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Drop your PDF here or click to upload</p>
              <p className="text-xs text-muted-foreground">PDF only, max 5MB</p>
            </button>
          )}
          {resumeProgress > 0 && <Progress value={resumeProgress} className="mt-3" />}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="purple" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save profile'}
        </Button>
      </div>

      <Dialog open={confirmRemoveResume} onClose={() => setConfirmRemoveResume(false)} title="Remove resume?">
        <p className="text-sm text-muted-foreground mb-4">This will permanently delete your resume from SkillArena.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setConfirmRemoveResume(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleRemoveResume}>Remove</Button>
        </div>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
