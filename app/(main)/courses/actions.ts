'use server';

import db from "@/db/drizzle";
import { courses, units, lessons, challenges } from "@/db/schema";
import { eq } from "drizzle-orm";

interface LearningObject {
  lo_id: number;
  name: string;
}

interface SubLO {
  material: string;
  name: string;
  reference: string;
}

interface LOResponse {
  lo_id: number;
  sub_los: SubLO[];
}

async function fetchSubLOs(loId: number): Promise<SubLO[]> {
  try {
    const response = await fetch('https://iia-one.vercel.app/fetch/lo/child-sub-los', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lo_id: loId })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sub LOs: ${response.status}`);
    }

    const data: LOResponse = await response.json();
    return data.sub_los;
  } catch (error) {
    console.error(`Error fetching sub LOs for ${loId}:`, error);
    return [];
  }
}

export async function createCourse(title: string, learningObjects: LearningObject[]) {
  try {
    // Create the course
    const imageSrc = `/images/${title.toLowerCase().replace(/ /g, '-')}.png`;
    const [newCourse] = await db.insert(courses).values({
      title,
      imageSrc,
    }).returning();

    if (!newCourse) throw new Error("Failed to create course");

    // Create the unit with the course title
    const [newUnit] = await db.insert(units).values({
      title,
      description: `Learn about ${title} and related technologies`,
      courseId: newCourse.id,
      order: 1,
    }).returning();

    if (!newUnit) throw new Error("Failed to create unit");

    // Create lessons and fetch their sub LOs
    const newLessons = [];
    for (let i = 0; i < learningObjects.length; i++) {
      const lo = learningObjects[i];
      
      // Create the lesson
      const lessonValues = {
        title: lo.name,
        unitId: newUnit.id,
        order: i + 1,
      } as const;
      
      const [lesson] = await db.insert(lessons).values(lessonValues).returning();

      if (!lesson) continue;
      newLessons.push(lesson);

      // Fetch and store sub LOs as challenges
      const subLOs = await fetchSubLOs(lo.lo_id);
      
      // Link existing challenges using references
      for (let j = 0; j < subLOs.length; j++) {
        const subLO = subLOs[j];
        if (subLO.reference) {
          // Link the existing challenge to this lesson
          await db.update(challenges)
            .set({ lessonId: lesson.id, order: j + 1 })
            .where(eq(challenges.id, parseInt(subLO.reference)));
        }
      }
    }

    return {
      course: newCourse,
      unit: newUnit,
      lessons: newLessons,
    };
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
}
