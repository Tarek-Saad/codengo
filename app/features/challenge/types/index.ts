import { quizOptions, challenges, wordOptions } from "@/db/schema";

export type ChallengeType = "SELECT" | "WRITE" | "CODE" | "COMPLETE" | "IMAGE" | "VIDEO" | "PDF" | "PROJECT" | "TEXT" | "ASSIST";

export interface Challenge {
  id: number;
  type: ChallengeType;
  label: string;
  question?: string;
  explanation?: string;
  completed: boolean;
  imageContent?: string;
  videoURL?: string;
  textContent?: string;
  pdfURL?: string;
  initialCode?: string;
  language?: string;
  instructions?: string;
  testCases?: string;
  projectStructure?: string;
  projectFiles?: string;
  completeQuestion?: string;
  quizOptions: QuizOption[];
  wordOptions?: WordOption[];
}

export interface QuizOption {
  id: number;
  text: string;
  correct: boolean;
  challengeId: number;
  audioSrc?: string;
  imageSrc?: string;
  order?: number;
}

export interface WordOption {
  id: number;
  word: string;
  order: number;
  correct: boolean;
}

export interface ChallengeProps {
  initialPercentage: number;
  initialHearts: number;
  initialLessonId: number;
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    quizOptions: (typeof quizOptions.$inferSelect)[];
    wordOptions?: (typeof wordOptions.$inferSelect)[];
  })[];
  userSubscription: any;
}

export interface ChallengeState {
  hearts: number;
  percentage: number;
  status: "correct" | "wrong" | "none";
  selectedOption?: number;
}

export interface ChallengeContextType extends ChallengeState {
  setHearts: (hearts: number) => void;
  setPercentage: (percentage: number) => void;
  setStatus: (status: "correct" | "wrong" | "none") => void;
  setSelectedOption: (option?: number) => void;
  onNext: () => void;
}
