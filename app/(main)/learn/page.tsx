import { getUserProgress } from '@/db/queries'

import FeedWrapper from '@/components/feed-wrapper'
import StickyWrapper from '@/components/sticky-wrapper'
import Header from './header' 
import UserProgress from '@/components/user-progress'
import { redirect } from 'next/navigation';


export default async function LearnPage() {
  const userProgress = await getUserProgress();

  if (!userProgress || !userProgress.activeCourseId || !userProgress.activeCourse) {
    redirect("/courses");
  }

  return (
    <div className='flex flex-row-reverse gap-[48px] px-6'>
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
        <div className='flex flex-col gap-y-4'>
          <div className='flex flex-col gap-y-2'>
            <h2 className='text-2xl font-bold'>Welcome to Flutter</h2>
            <div className='h-[700px] bg-blue-500 w-full bg-border/50' />
          </div>
          
        </div>
      </FeedWrapper>
    </div>
  )
}
