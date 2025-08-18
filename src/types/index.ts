export interface Goal {
  id: number;
  title: string;
  metric: string;
  current: number;
  target: number;
  unit: string;
  status: 'En Progreso' | 'Completado';
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
  suggestedGoal?: {
    title: string;
    metric: string;
    target: number;
    unit: string;
    reasoning: string;
  } | null;
}

export interface ConversationMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export type ViewType = 'coach' | 'metas' | 'recursos' | 'perfil';
