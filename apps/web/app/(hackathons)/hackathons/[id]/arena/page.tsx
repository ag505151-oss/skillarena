import type { Metadata } from 'next';
import { HackathonArenaClient } from '@/components/hackathons/HackathonArenaClient';

export const metadata: Metadata = { title: 'Hackathon Arena' };

export default function ArenaPage({ params }: { params: { id: string } }) {
  return <HackathonArenaClient hackathonId={params.id} />;
}
