export interface Goal {
  id: number;
  title: string;
  metric: string;
  current: number;
  target: number;
  unit: string;
  status: 'En Progreso' | 'Completado';
  createdAt: Date;
  lastUpdated: Date;
  progressHistory: ProgressEntry[];
  reminderFrequency: 'daily' | 'weekly' | 'monthly';
  nextReminder: Date;
  deadline?: Date;
}

export interface Resource {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
}

export interface CoachResponse {
  truth: string;
  plan: string[];
  challenge: string;
  suggestedResource: string | null;
  suggestionContext: string | null;
  meta?: string;
}

export interface ConversationMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ProgressEntry {
  date: Date;
  value: number;
  notes?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder' | 'achievement' | 'motivation';
  isRead: boolean;
  createdAt: Date;
  goalId?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  actionRequired?: boolean;
  actionUrl?: string;
}

export interface CoachReminder {
  id: string;
  goalId: number;
  message: string;
  scheduledFor: Date;
  isCompleted: boolean;
}

export type ViewType = 'coach' | 'dashboard' | 'metas' | 'recursos' | 'perfil';
