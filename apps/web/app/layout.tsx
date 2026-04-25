import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from '@/components/shared/Providers';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';

export const metadata: Metadata = {
  title: { default: 'SkillArena — Interviews, Hackathons & Mock Tests', template: '%s | SkillArena' },
  description: 'Live coding interviews, real-time hackathons, and mock tests with AI-powered performance insights — all in one place.',
  openGraph: {
    title: 'SkillArena — Get Hired Faster',
    description: 'Live coding interviews, real-time hackathons, and mock tests with AI-powered performance insights.',
    url: 'https://skillarena.dev',
    siteName: 'SkillArena',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
