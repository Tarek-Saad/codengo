import { Heart } from "lucide-react";

interface HeartsProps {
  amount: number;
}

export const Hearts = ({ amount }: HeartsProps) => {
  return (
    <div className="flex items-center gap-x-2">
      <Heart className="h-6 w-6 text-rose-500" />
      <span className="text-rose-500 font-bold">
        {amount}
      </span>
    </div>
  );
};
