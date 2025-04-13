"use client";

import { useAudio } from "react-use";

export const useAudioEffects = () => {
  const [correctAudio, , correctControls] = useAudio({ src: "/correct.wav" });
  const [incorrectAudio, , incorrectControls] = useAudio({ src: "/incorrect.wav" });
  const [finishAudio] = useAudio({ src: "/finish.mp3", autoPlay: true });

  return {
    correctAudio,
    incorrectAudio,
    finishAudio,
    correctControls,
    incorrectControls
  };
};
