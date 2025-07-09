export type QuestionFormat = 'multiple-choice' | 'true-false' | 'fill-blank' | 'catch-mistake' | 'matching' | 'ordering' | 'mix' | 'auto';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface Problem {
  id: string;
  question: string;
  subject: string;
  grade: number;
  topic: string; // Specific textbook topic
  format: QuestionFormat;
  steps?: string[]; // For catch-mistake format
  options?: QuestionOption[]; // For multiple choice, true-false
  correctAnswer: number | string | boolean;
  hasError?: boolean; // For catch-mistake format
  errorStep?: number; // For catch-mistake format
  explanation: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  opponentId?: string;
  storyContext?: string;
  hints?: string[];
  blanks?: string[]; // For fill-in-the-blank format
  matchingPairs?: { question: string; answer: string }[]; // For matching format
  orderingItems?: string[]; // For ordering format
}

export interface AIOpponent {
  id: string;
  name: string;
  character: string;
  personality: string;
  avatar: string;
  unlockLevel: number;
  mistakePatterns: string[];
  difficulty: number;
  backstory: string;
  reactions: {
    victory: string[];
    defeat: string[];
    mistake: string[];
    correct: string[];
  };
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  effect: 'extraTime' | 'hint' | 'skip' | 'doublePoints' | 'slowTime';
  duration?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: 'streak' | 'score' | 'battles' | 'opponents' | 'accuracy' | 'speed';
    value: number;
  };
  reward: {
    type: 'opponent' | 'powerup' | 'theme' | 'title';
    value: string;
  };
  unlocked: boolean;
  progress: number;
}

export interface CharacterProgress {
  easy: boolean;
  normal: boolean;
  hard: boolean;
  expert: boolean;
}

export interface PlayerProfile {
  id: string;
  name: string;
  level: number;
  totalScore: number;
  battlesWon: number;
  battlesPlayed: number;
  bestStreak: number;
  unlockedOpponents: string[];
  unlockedAchievements: string[];
  powerUps: { [key: string]: number };
  preferences: {
    soundEnabled: boolean;
    difficulty: string;
    favoriteSubject: string;
  };
  stats: {
    averageResponseTime: number;
    accuracyRate: number;
    mistakesCaught: number;
    perfectGames: number;
  };
  // New: per-character, per-difficulty progress
  characterProgress: {
    [opponentId: string]: CharacterProgress;
  };
}

export interface GameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  timeLeft: number;
  isActive: boolean;
  selectedGrade: string;
  selectedSubject: string;
  selectedDifficulty: string;
  selectedOpponent: AIOpponent | null;
  currentProblem: Problem | null;
  showingSolution: boolean;
  gamePhase: 'setup' | 'opponent-select' | 'problem' | 'solution' | 'feedback' | 'complete' | 'victory';
  activePowerUps: PowerUp[];
  usedPowerUps: string[];
}