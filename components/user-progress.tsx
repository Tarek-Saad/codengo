import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InfinityIcon } from "lucide-react";

import { courses } from "@/db/schema";

type Props = {
    activeCourse: typeof courses.$inferSelect;
    hearts: number;
    points: number;
    hasActiveSubscription: boolean;
}

export default function UserProgress({ activeCourse, hearts, points, hasActiveSubscription }: Props) {
    return (
        <div className="flex items-center justify-between gap-x-2 w-full">
          <Link href="/courses">
            <Button variant="ghost">
                <Image src={activeCourse.imageSrc} alt={activeCourse.title} width={35} height={35} className="rounded-md hover:scale-105 transition-all duration-300" />
            </Button>
          </Link>  
          <Link href="/shop">
            <Button variant="ghost" className="text-orange-500">
                <Image src="/points.svg" alt="points" width={28} height={28} className="mr-2" />
                {points}
            </Button>
          </Link>   
          <Link href="/shop">
            <Button variant="ghost" className="text-rose-500">
                <Image src="/heart.svg" alt="heart" width={22} height={22} className="mr-2" />
                {hasActiveSubscription ? <InfinityIcon className="w-4 h-4 stroke-[3]" /> : hearts}
            </Button>
          </Link>
        </div>
    )
}
