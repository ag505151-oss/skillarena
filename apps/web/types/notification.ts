export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INTERVIEW' | 'HACKATHON' | 'TEST' | 'SYSTEM';
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}
