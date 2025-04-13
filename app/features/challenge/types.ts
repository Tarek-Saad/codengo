import { challenges, quizOptions } from "@/db/schema";

export type Challenge = typeof challenges.$inferSelect & {
  completed: boolean;
  quizOptions: (typeof quizOptions.$inferSelect)[];
};

export type ChallengeState = {
  hearts: number;
  percentage: number;
  status: 'correct' | 'wrong' | 'none';
  selectedOption: number | undefined;
};

export type ChallengeContextType = {
  hearts: number;
  percentage: number;
  status: 'correct' | 'wrong' | 'none';
  selectedOption: number | undefined;
  setHearts: (hearts: number | ((prev: number) => number)) => void;
  setPercentage: (percentage: number | ((prev: number) => number)) => void;
  setStatus: (status: 'correct' | 'wrong' | 'none') => void;
  setSelectedOption: (option: number | undefined) => void;
  onNext: () => void;
  onSelect: (id: number) => void;
};

export type ChallengeProps = {
  initialPercentage: number;
  initialHearts: number;
  initialLessonId: number;
  initialLessonChallenges: Challenge[];
  userSubscription: any;
};
