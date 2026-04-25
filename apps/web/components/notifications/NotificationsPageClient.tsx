'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Video, Trophy, FileText, Settings, CheckCheck, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from '@/lib/time';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/types/notification';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

type FilterType = 'ALL' | 'UNREAD' | 'INTERVIEW' | 'HACKATHON' | 'TEST' | 'SYSTEM';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'ALL',       label: 'All' },
  { id: 'UNREAD',    label: 'Unread' },
  { id: 'INTERVIEW', label: 'Interviews' },
  { id: 'HACKATHON', label: 'Hackathons' },
  { id: 'TEST',      label: 'Tests' },
  { id: 'SYSTEM',    label: 'System' },
];

const TYPE_CONFIG = {
  INTERVIEW: { icon: Video,     bg: 'bg-[#534AB7]/10', color: 'text-[#534AB7]' },
  HACKATHON: { icon: Trophy,    bg: 'bg-[#1D9E75]/10', color: 'text-[#1D9E75]' },
  TEST:      { icon: FileText,  bg: 'bg-[#EF9F27]/10', color: 'text-[#EF9F27]' },
  SYSTEM:    { icon: Settings,  bg: 'bg-muted',         color: 'text-muted-foreground' },
};

interface Props { apiToken: string }

export function NotificationsPageClient({ apiToken }: Props) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${apiToken}` },
        cache: 'no-store',
      });
      const json = await res.json();
      if (json.success && json.data) {
        setNotifications(json.data);
      } else {
        toast.error(json.error ?? 'Failed to load notifications');
      }
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [apiToken]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  async function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await fetch(`${API}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${apiToken}` },
    });
  }

  async function markAllAsRead() {
    setMarkingAll(true);
    try {
      await fetch(`${API}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  }

  function handleClick(n: NotificationItem) {
    if (!n.isRead) markAsRead(n.id);
    if (n.link) router.push(n.link);
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !n.isRead;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#534AB7] px-1.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={markAllAsRead}
            disabled={markingAll}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto border-b pb-0 scrollbar-none">
        {FILTERS.map((f) => {
          const count = f.id === 'UNREAD'
            ? notifications.filter((n) => !n.isRead).length
            : f.id === 'ALL'
            ? 0
            : notifications.filter((n) => n.type === f.id).length;

          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                filter === f.id
                  ? 'border-[#534AB7] text-[#534AB7]'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
              {count > 0 && (
                <span className={cn(
                  'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                  filter === f.id ? 'bg-[#534AB7] text-white' : 'bg-muted text-muted-foreground',
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <NotificationsSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {filtered.map((n, i) => {
              const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.SYSTEM;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleClick(n)}
                  className={cn(
                    'flex cursor-pointer items-start gap-4 rounded-xl p-4 transition-colors hover:bg-accent',
                    !n.isRead && 'bg-muted/60',
                  )}
                >
                  {/* Icon */}
                  <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', cfg.bg)}>
                    <Icon className={cn('h-4 w-4', cfg.color)} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm', !n.isRead ? 'font-semibold' : 'font-medium')}>
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt))}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#534AB7]" />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 rounded-xl p-4">
          <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ filter }: { filter: FilterType }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">
        {filter === 'UNREAD' ? 'No unread notifications' : "You're all caught up!"}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {filter === 'ALL'
          ? "No notifications yet. We'll let you know when something happens."
          : `No ${filter.toLowerCase()} notifications to show.`}
      </p>
    </div>
  );
}
