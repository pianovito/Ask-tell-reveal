export interface Topic {
  id: number;
  name: string;
  description: string;
  icon: string;
  colorClass: string;
}

export interface Prompt {
  stage: "Ask" | "Tell" | "Reveal";
  question: string;
  context: string;
  hintWords: string[];
  vocabularyChallenge?: string; // Optional vocabulary word to include in response
}

export interface GamePrompts {
  stages: Prompt[];
}

export type CEFRLevel = "B1" | "B2" | "C1";

// Gamification types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress?: number; // For progress-based achievements
  maxProgress?: number;
}

export interface GameStats {
  groupXP: number;
  roundsCompleted: number;
  achievements: Achievement[];
}

// Default achievements to be unlocked during gameplay
export const defaultAchievements: Achievement[] = [
  {
    id: "everyone_revealed",
    name: "Group Revelation",
    description: "Everyone completed a 'Reveal' prompt",
    icon: "fa-star",
    isUnlocked: false
  },
  {
    id: "vocabulary_master",
    name: "Vocabulary Master",
    description: "Successfully used 5 vocabulary challenge words",
    icon: "fa-book",
    isUnlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: "topic_explorer",
    name: "Topic Explorer",
    description: "Practiced with 3 different topics",
    icon: "fa-compass",
    isUnlocked: false,
    progress: 0,
    maxProgress: 3
  }
];
