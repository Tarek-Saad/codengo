import { toast } from "sonner";
import { VerificationOptions, VerificationResult } from "./types";
import {
  verifyWriteAnswer,
  verifyCodeAnswer,
  verifyCompleteAnswer,
  verifyProjectAnswer
} from "./verifiers";

export * from "./types";

export const verifyChallengeAnswer = async ({
  onSuccess,
  onFailure,
  upsertProgress,
  reduceHearts,
  challengeId,
  type,
  answer,
  expectedAnswer,
}: VerificationOptions): Promise<VerificationResult> => {
  try {
    let result: VerificationResult;

    // Verify based on challenge type
    switch (type) {
      case "SELECT":
        result = {
          isCorrect: answer === expectedAnswer,
          feedback: answer === expectedAnswer ? "Correct!" : "Try another option."
        };
        break;
      case "WRITE":
        if (typeof answer !== 'string' || typeof expectedAnswer !== 'string') {
          throw new Error('Write challenge requires string answers');
        }
        result = verifyWriteAnswer(answer, expectedAnswer);
        break;
      case "CODE":
        if (typeof answer !== 'string' || typeof expectedAnswer !== 'string') {
          throw new Error('Code challenge requires string answers');
        }
        result = verifyCodeAnswer(answer, expectedAnswer);
        break;
      case "COMPLETE":
        if (!Array.isArray(answer) || !Array.isArray(expectedAnswer)) {
          throw new Error('Complete challenge requires string[] answers');
        }
        result = verifyCompleteAnswer(answer, expectedAnswer);
        break;
      case "PROJECT":
        if (typeof answer !== 'object' || typeof expectedAnswer !== 'object') {
          throw new Error('Project challenge requires object answers');
        }
        result = await verifyProjectAnswer(answer as Record<string, unknown>, expectedAnswer as Record<string, unknown>);
        break;
      default:
        throw new Error(`Unsupported challenge type: ${type}`);
    }

    if (result.isCorrect) {
      const response = await upsertProgress(challengeId);
      if (response?.error === "hearts") {
        return { isCorrect: false, error: "hearts", feedback: "You need more hearts!" };
      }
      onSuccess();
      return result;
    } else {
      const response = await reduceHearts(challengeId);
      if (response?.error === "hearts") {
        return { isCorrect: false, error: "hearts", feedback: "You need more hearts!" };
      }
      onFailure();
      return result;
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong!");
    return { isCorrect: false, error: "unknown", feedback: "An error occurred. Please try again." };
  }
};
