export type ChallengeType =
  | "ASSIST"
  | "SELECT"
  | "CODE"
  | "VIDEO"
  | "TEXT"
  | "COMPLETE"
  | "PROJECT"
  | string; // fallback for any custom types

type Challenge = {
  type: ChallengeType;
  label: string;
};

export const getChallengeTitle = (challenge: Challenge): string => {
  switch (challenge.type) {
    case "ASSIST":
      return "Select the correct meaning";
    case "SELECT":
      return "Choose the correct option";
    case "CODE":
      return "Write the correct code";
    case "VIDEO":
      return "Watch the video";
    case "TEXT":
      return "Read the text";
    case "COMPLETE":
      return "Complete the sentence";
    case "PROJECT":
      return "Build the project";
    default:
      return challenge.label;
  }
};