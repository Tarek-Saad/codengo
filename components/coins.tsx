import { Coins as CoinsIcon } from "lucide-react";

interface CoinsProps {
  amount: number;
}

export const Coins = ({ amount }: CoinsProps) => {
  return (
    <div className="flex items-center gap-x-2">
      <CoinsIcon className="h-6 w-6 text-yellow-500" />
      <span className="text-yellow-500 font-bold">
        {amount}
      </span>
    </div>
  );
};
