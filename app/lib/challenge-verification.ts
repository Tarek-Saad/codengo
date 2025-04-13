import { toast } from "sonner";

type VerificationResult = {
  isCorrect: boolean;
  error?: string;
};

type VerificationOptions = {
  onSuccess: () => void;
  onFailure: () => void;
  upsertProgress: (challengeId: number) => Promise<{ error?: string }>;
  reduceHearts: (challengeId: number) => Promise<{ error?: string }>;
  challengeId: number;
};

export const verifyChallengeAnswer = async ({
  onSuccess,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFailure,
  upsertProgress,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  reduceHearts,
  challengeId,
}: VerificationOptions): Promise<VerificationResult> => {
  try {
    const response = await upsertProgress(challengeId);
    
    if (response?.error === "hearts") {
      return { isCorrect: false, error: "hearts" };
    }

    onSuccess();
    return { isCorrect: true };
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong!");
    return { isCorrect: false, error: "unknown" };
  }
};

export const handleIncorrectAnswer = async ({
  onFailure,
  reduceHearts,
  challengeId,
}: VerificationOptions): Promise<VerificationResult> => {
  try {
    const response = await reduceHearts(challengeId);
    
    if (response?.error === "hearts") {
      return { isCorrect: false, error: "hearts" };
    }

    onFailure();
    return { isCorrect: false };
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong. Please try again.");
    return { isCorrect: false, error: "unknown" };
  }
};
