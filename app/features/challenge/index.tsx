"use client";

import { useState } from "react";
import { useMount } from "react-use";
import { usePracticeModal } from "@/store/use-practice-modal";
import { ChallengeProps } from "./types";
import { ChallengeProvider } from "./contexts/ChallengeContext";
import { ChallengeContainer } from "./components/ChallengeContainer";
import { ChallengeContent } from "./components/ChallengeContent";
import { useAudioEffects } from "./hooks/useAudioEffects";

export const Challenge = ({
  initialPercentage,
  initialHearts,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialLessonId,
  initialLessonChallenges,
  userSubscription,
}: ChallengeProps) => {
  const { open: openPracticeModal } = usePracticeModal();
  const { finishAudio } = useAudioEffects();

  useMount(() => {
    if (initialPercentage === 100) {
      openPracticeModal();
    }
  });

  const [challenges] = useState(initialLessonChallenges);
  const [activeIndex, setActiveIndex] = useState(() => {
    const index = challenges.findIndex((challenge) => !challenge.completed);
    return index >= 0 ? index : 0; // Default to 0 if no incomplete challenge found
  });

  const challenge = challenges[activeIndex];
  if (!challenge) {
    console.error('No challenge found at index:', activeIndex);
    return null;
  }

  const handleNextChallenge = () => {
    const nextIndex = activeIndex + 1;
    if (nextIndex < challenges.length) {
      setActiveIndex(nextIndex);
    } else {
      // All challenges completed
      openPracticeModal();
    }
  };

  const initialState = {
    hearts: initialHearts,
    percentage: initialPercentage === 100 ? 0 : initialPercentage,
    status: "none" as const,
    selectedOption: undefined
  };

  return (
    <ChallengeProvider initialState={initialState}>
      {finishAudio}
      <ChallengeContainer
        initialHearts={initialHearts}
        initialPercentage={initialPercentage}
        userSubscription={userSubscription}
      >
        <ChallengeContent
          challenge={challenge}
          initialPercentage={initialPercentage}
          challengesLength={challenges.length}
          onComplete={handleNextChallenge}
        />
      </ChallengeContainer>
    </ChallengeProvider>
  );
};
