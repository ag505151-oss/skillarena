'use client';

import { useNotificationStore } from '@/store/notification.store';

export function NotificationBell(): JSX.Element {
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  return (
    <button type="button" className="relative rounded border px-3 py-1 text-sm">
      Notifications
      {unreadCount > 0 && (
        <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 text-xs text-white">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
