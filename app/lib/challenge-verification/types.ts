export const CHALLENGE_TYPES = ["SELECT", "WRITE", "CODE", "COMPLETE", "PROJECT"] as const;
export type ChallengeType = typeof CHALLENGE_TYPES[number];

export type VerificationResult = {
  isCorrect: boolean;
  error?: string;
  feedback?: string;
};

export type VerificationOptions = {
  onSuccess: () => void;
  onFailure: () => void;
  upsertProgress: (challengeId: number) => Promise<{ error?: string }>;
  reduceHearts: (challengeId: number) => Promise<{ error?: string }>;
  challengeId: number;
  type: ChallengeType;
  answer: string | number | string[] | Record<string, unknown>;
  expectedAnswer?: string | number | string[] | Record<string, unknown>;
};
