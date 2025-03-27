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
}

export interface GamePrompts {
  stages: Prompt[];
}

export type CEFRLevel = "B1" | "B2" | "C1";
