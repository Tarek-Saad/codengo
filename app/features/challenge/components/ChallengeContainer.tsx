"use client";

import { useWindowSize } from "react-use";
import { ChallengeProps } from "../types";
import { Header } from "@/app/lesson/header";
import dynamic from "next/dynamic";
import { getChallengeTitle } from "./utils/getChallengeTitle";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

export const ChallengeContainer = ({
  initialHearts,
  initialPercentage,
  userSubscription,
  children,
}: Partial<ChallengeProps> & { children: React.ReactNode }) => {
  const { width, height } = useWindowSize();

  return (
    <div className="h-full flex flex-col">
      <Header
        hearts={initialHearts || 0}
        percentage={initialPercentage || 0}
        hasActiveSubscription={!!userSubscription}
      />
      
      <div className="flex-1 flex items-center justify-center px-6 lg:px-0">
        <div className="lg:min-h-[400px] lg:w-[1000px] w-full flex flex-col gap-y-12">
          {children}
        </div>
      </div>

      {typeof window !== "undefined" && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={0}
          recycle={false}
        />
      )}
    </div>
  );
};
