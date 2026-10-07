export type CategoryType =
  | 'Mathematics'
  | 'Physics'
  | 'Computer Studies'
  | 'English'
  | 'Biology'
  | 'Other';

export interface CategoryInfo {
  id: CategoryType;
  name: string;
  emoji: string;
  color: string;
  borderColor: string;
  bgColor: string;
  iconBg: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  subject: string;
  category: CategoryType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // in minutes (30, 45, 60, 90, 120, 180)
  done: boolean;
  notes?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  studentYear: string;
  registrationNumber?: string;
  avatarSeed: string;
  theme?: 'dark' | 'neon-cyber';
}

export type ViewMode = 'welcome' | 'home' | 'planner' | 'ai-sensei' | 'ai-search';

export type AIMentorRole = 'algorithms' | 'systems' | 'math' | 'coach';

export type AIModelTier = 'general' | 'fast' | 'complex';

export interface GroundingSource {
  title: string;
  url: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  sources?: GroundingSource[];
  searchQueries?: string[];
  modelUsed?: string;
  suggestedPlan?: {
    subject: string;
    category: CategoryType;
    duration: number;
    notes?: string;
  };
}

export interface ContactMessage {
  name: string;
  email: string;
  phone: string;
  registrationNumber: string;
  message: string;
  submittedAt: string;
}
