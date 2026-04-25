'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Palette, Bell, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { UserData } from '@/types/settings';
import { ProfileTab } from './tabs/ProfileTab';
import { AccountTab } from './tabs/AccountTab';
import { AppearanceTab } from './tabs/AppearanceTab';
import { NotificationsTab } from './tabs/NotificationsTab';

const TABS = [
  { id: 'profile',       label: 'Profile',      icon: User },
  { id: 'account',       label: 'Account',       icon: Shield },
  { id: 'appearance',    label: 'Appearance',    icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const;

type TabId = typeof TABS[number]['id'];

interface Props { apiToken: string; userEmail: string; userName: string }

export function SettingsClient({ apiToken, userEmail: _userEmail, userName: _userName }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/api/user/settings`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      const json = await res.json();
      if (json.success) setUserData(json.data);
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [apiToken]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  function handleTabChange(tab: TabId) {
    if (dirty) {
      // warn but allow switch
      toast.warning('You have unsaved changes');
    }
    setActiveTab(tab);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account, appearance, and notification preferences.</p>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b pb-0 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-[#534AB7] text-[#534AB7]'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? (
            <SettingsSkeleton />
          ) : (
            <>
              {activeTab === 'profile' && (
                <ProfileTab userData={userData} apiToken={apiToken} onDirty={setDirty} onSaved={fetchSettings} />
              )}
              {activeTab === 'account' && (
                <AccountTab userData={userData} apiToken={apiToken} onDirty={setDirty} onSaved={fetchSettings} />
              )}
              {activeTab === 'appearance' && (
                <AppearanceTab />
              )}
              {activeTab === 'notifications' && (
                <NotificationsTab userData={userData} apiToken={apiToken} onSaved={fetchSettings} />
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Unsaved changes banner */}
      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-xl border bg-card px-5 py-3 shadow-xl"
          >
            <AlertTriangle className="h-4 w-4 text-[#EF9F27]" />
            <span className="text-sm font-medium">You have unsaved changes</span>
            <Button size="sm" variant="ghost" onClick={() => { setDirty(false); fetchSettings(); }}>Discard</Button>
            <Button size="sm" variant="purple" onClick={() => { setDirty(false); fetchSettings(); }}>
              <Save className="h-3.5 w-3.5" /> Save
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}
