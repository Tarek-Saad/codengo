import { VerificationResult } from "./types";

// Verify write answers using Levenshtein distance for spell tolerance
export const verifyWriteAnswer = (answer: string, expectedAnswer: string): VerificationResult => {
  const similarity = 1 - levenshteinDistance(answer.toLowerCase(), expectedAnswer.toLowerCase()) / Math.max(answer.length, expectedAnswer.length);
  const isCorrect = similarity >= 0.8; // 80% similarity threshold
  return {
    isCorrect,
    feedback: isCorrect ? "Great job!" : "Almost there! Check your spelling."
  };
};

// Verify code answers by comparing normalized code
export const verifyCodeAnswer = (answer: string, expectedAnswer: string): VerificationResult => {
  // Remove whitespace and compare
  const normalizedAnswer = answer.replace(/\s+/g, '').toLowerCase();
  const normalizedExpected = expectedAnswer.replace(/\s+/g, '').toLowerCase();
  const isCorrect = normalizedAnswer === normalizedExpected;
  return {
    isCorrect,
    feedback: isCorrect ? "Perfect code!" : "Your code output doesn't match the expected result."
  };
};

// Verify complete challenge answers by comparing arrays
export const verifyCompleteAnswer = (answer: string[], expectedAnswer: string[]): VerificationResult => {
  if (answer.length !== expectedAnswer.length) {
    return {
      isCorrect: false,
      feedback: "You need to fill in all the blanks."
    };
  }
  const isCorrect = answer.every((ans, i) => ans.toLowerCase() === expectedAnswer[i].toLowerCase());
  return {
    isCorrect,
    feedback: isCorrect ? "Perfect match!" : "Some words don't match. Try again!"
  };
};

// Verify project answers by running tests
export const verifyProjectAnswer = async (answer: Record<string, unknown>, expectedAnswer: Record<string, unknown>): Promise<VerificationResult> => {
  const isCorrect = JSON.stringify(answer) === JSON.stringify(expectedAnswer);
  // Project verification would typically involve running tests
  // This should be implemented based on your testing system
  return {
    isCorrect,
    feedback: isCorrect ? "Project tests passed successfully!" : "Project tests failed. Check the test output for details."
  };
};

// Helper function for Levenshtein distance calculation
function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[b.length][a.length];
}
