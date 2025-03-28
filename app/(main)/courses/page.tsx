import { getCourses, getUserProgress } from "@/db/queries";
import List from "./list";

export default async function CoursesPage() {
  const [courses, userProgress] = await Promise.all([
    getCourses(),
    getUserProgress(),
  ]);

  return (
    <div className="h-full max-w-[912px] mx-auto px-3">
      <h1 className="text-2xl font-bold text-neutral-700">
        Personalize Courses <br />{" "}
        <span className="text-green-500 text-sm bg-green-50 px-2 py-1 rounded-md">
          make for you
        </span>
      </h1>
      <List 
      courses={courses} 
      activeCourseId={userProgress?.activeCourseId}
       />
    </div>
  );
}
