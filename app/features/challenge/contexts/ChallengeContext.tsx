"use client";

import { createContext, useContext, useState } from "react";
import { ChallengeContextType, ChallengeState } from "../types";

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const ChallengeProvider = ({ children, initialState }: { children: React.ReactNode, initialState: ChallengeState }) => {
  const [hearts, setHearts] = useState(initialState.hearts);
  const [percentage, setPercentage] = useState(initialState.percentage);
  const [status, setStatus] = useState<'correct' | 'wrong' | 'none'>(initialState.status);
  const [selectedOption, setSelectedOption] = useState<number | undefined>(initialState.selectedOption);

  const onNext = () => {
    setStatus('none');
    setSelectedOption(undefined);
  };

  const onSelect = (id: number) => {
    if (status !== 'none') return;
    console.log('Selecting option:', id);
    setSelectedOption(id);
  };

  return (
    <ChallengeContext.Provider value={{
      hearts,
      percentage,
      status,
      selectedOption,
      setHearts,
      setPercentage,
      setStatus,
      setSelectedOption,
      onNext,
      onSelect
    }}>
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallengeContext = () => {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error("useChallengeContext must be used within a ChallengeProvider");
  }
  return context;
};
