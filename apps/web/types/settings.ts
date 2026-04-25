export interface UserData {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  twitterHandle?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  skills: string[];
  resumeUrl?: string | null;
  resumeUploadedAt?: string | null;
  role: string;
  plan: 'FREE' | 'PRO' | 'LIFETIME';
  planExpiresAt?: string | null;
  stripeCustomerId?: string | null;
  provider?: string | null;
  twoFactorEnabled: boolean;
  notificationPrefs?: Record<string, boolean | string> | null;
  digestFrequency?: 'immediately' | 'daily' | 'weekly' | null;
  editorPrefs?: {
    theme?: string;
    fontSize?: number;
    tabSize?: number;
  } | null;
  createdAt: string;
}
