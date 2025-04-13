import { Star } from "lucide-react";

interface PointsProps {
  amount: number;
}

export const Points = ({ amount }: PointsProps) => {
  return (
    <div className="flex items-center gap-x-2">
      <Star className="h-6 w-6 text-emerald-500" />
      <span className="text-emerald-500 font-bold">
        {amount}
      </span>
    </div>
  );
};
