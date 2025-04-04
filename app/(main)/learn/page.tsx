import { getCourseProgress, getUnits, getUserProgress , getLessonPercentage } from "@/db/queries";

import FeedWrapper from "@/components/feed-wrapper";
import StickyWrapper from "@/components/sticky-wrapper";
import Header from "./header";
import UserProgress from "@/components/user-progress";
import { redirect } from "next/navigation";
import { Unit } from "./unit";

export default async function LearnPage() {
  const userProgressData = getUserProgress();

  const courseProgressData = getCourseProgress();
  const lessonPercentageData = getLessonPercentage();

  const unitsData = getUnits();

  const [
    userProgress,
    units , 
    courseProgress,
    lessonPercentage,
  ] = await Promise.all([userProgressData, unitsData , courseProgressData, lessonPercentageData]);

  if (
    !userProgress ||
    !userProgress.activeCourseId ||
    !userProgress.activeCourse
  ) {
    redirect("/courses");
  }

  if (!courseProgress) {
    redirect("/courses");
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse!}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={false}
        />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={userProgress.activeCourse.title} />
        {units.map((unit) => (
          <div key={unit.id} className="mb-10">
            <Unit
              id={unit.id}
              order={unit.order}
              description={unit.description}
              title={unit.title}
              lessons={unit.lessons}
              activeLesson={courseProgress.activelesson}  
              activeLessonPercentage={lessonPercentage} 
            />

          </div>
        ))}

      </FeedWrapper>
    </div>
  );
}
