"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { reduceHearts } from "@/actions/user-progress";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { useChallengeContext } from "../contexts/ChallengeContext";
import { useAudioEffects } from "../hooks/useAudioEffects";

export const useChallengeProgress = (
  challengeId: number,
  initialPercentage: number,
  challengesLength: number,
  onComplete?: () => void
) => {
  const [pending, startTransition] = useTransition();
  const { openHeartsModal } = useHeartsModal();
  const { setHearts, setPercentage } = useChallengeContext();
  const { correctControls } = useAudioEffects();
  const { incorrectControls } = useAudioEffects();

  const handleCorrectAnswer = () => {
    startTransition(() => {
      upsertChallengeProgress(challengeId)
        .then((response) => {
          if (response?.error === "hearts") {
            openHeartsModal();
            return;
          }
          correctControls.play();
          setPercentage((prev) => prev + 100 / challengesLength);
          if (initialPercentage === 100) {
            setHearts((prev) => Math.min(prev + 1, 5));
          }
          // Move to next challenge after a delay to allow animations and state updates
          setTimeout(() => {
            if (typeof onComplete === 'function') {
              onComplete();
            }
          }, 200);
        })
        .catch(() => {
          toast.error("Something went wrong!");
        });
    });
  };

  const handleWrongAnswer = () => {
    startTransition(() => {
      reduceHearts(challengeId)
        .then((response) => {
          if (response?.error === "hearts") {
            openHeartsModal();
            return;
          }
          incorrectControls.play();
          if (!response?.error) {
            setHearts((prev) => Math.max(prev - 1, 0));
          }
        })
        .catch(() => {
          toast.error("Something went wrong. Please try again.");
        });
    });
  };

  return {
    pending,
    handleCorrectAnswer,
    handleWrongAnswer
  };
};
