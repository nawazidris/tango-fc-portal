export interface MatchEvent {
  type: "goal" | "assist" | "yellow_card" | "red_card" | "substitution";
  team: "home" | "away";
  player: string;
  minute?: number;
  assist?: string;
  player_out?: string;
  player_in?: string;
}

export interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  time: string;
  venue: string;
  status: "upcoming" | "completed";
  competition: string;
  events: MatchEvent[];
  playerOfTheMatch?: string;
}

export interface Player {
  id: number;
  name: string;
  nickname?: string;
  position: "Forward" | "Midfielder" | "Defender" | "Goalkeeper";
  number: number | null;
  goals: number;
  assists: number;
  cleanSheets: number;
  gamesPlayed: number;
  savePercentage?: number;
  playerImage: string;
  isNewSigning?: boolean;
}

export interface Team {
  name: string;
  stats: [number, number, number, number, number, number, number, number]; // [P, W, D, L, GF, GA, GD, Pts]
}

export interface NewsArticle {
  id: number;
  title: string;
  date: string;
  category: string;
  p1: string;
  p2?: string;
  imageUrl: string;
}

export interface TechnicalMember {
  id: number;
  name: string;
  role: string;
  title: string;
  experience: string;
  description: string;
  image: string;
}

export interface PhilosophyPillar {
  name: string;
  description: string;
}

export interface Achievement {
  year: string;
  title: string;
  description: string;
}

export interface Milestone {
  year: string;
  desc: string;
}

export interface ClubHistory {
  foundedYear: number;
  founder: string;
  club: string;
  stadium: string;
  capacity: number;
  description: string;
  philosophy: {
    title: string;
    description: string;
    pillars: PhilosophyPillar[];
  };
  achievements: Achievement[];
  milestones: Milestone[];
}

export interface GalleryItem {
  id: number;
  url: string;
  title: string;
  category: "newseason" | "matchday" | "champions";
}

export interface VideoItem {
  id: number;
  url: string;
  title: string;
  category: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  active: boolean;
  createdAt: string;
}

export interface DatabaseState {
  players: Player[];
  matches: Match[];
  teams: Team[];
  news: NewsArticle[];
  technicalTeam: TechnicalMember[];
  history: ClubHistory;
  gallery: GalleryItem[];
  videos: VideoItem[];
  playerMonthlyVotes: Record<number, number>;
  polls?: Poll[];
}
