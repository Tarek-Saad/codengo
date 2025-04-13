import { Hearts } from "@/app/components/hearts";
import { Coins } from "@/app/components/coins";
import { Points } from "@/app/components/points";

interface ChallengeFooterProps {
  hearts: number;
  coins?: number;
  points?: number;
}

export const ChallengeFooter = ({
  hearts,
  coins = 0,
  points = 0
}: ChallengeFooterProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Hearts amount={hearts} />
        <Points amount={points} />
        <Coins amount={coins} />
      </div>
    </div>
  );
};
