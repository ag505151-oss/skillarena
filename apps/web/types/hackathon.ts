export interface HackathonListItem {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  status: 'UPCOMING' | 'LIVE' | 'ENDED';
  maxTeamSize: number;
  entryFee: number;
}

export interface HackathonProblem {
  id: string;
  points: number;
  question: {
    title: string;
    description: string;
    difficulty: string;
  };
}

export interface HackathonDetail extends HackathonListItem {
  problems: HackathonProblem[];
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  userId?: string | null;
  teamId?: string | null;
  score: number;
  solvedCount: number;
  lastSubmit: string;
}
