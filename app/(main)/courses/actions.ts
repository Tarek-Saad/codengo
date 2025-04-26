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
    console.log('Creating course:', title);
    console.log('Learning objects:', learningObjects);

    // Create the course
    const imageSrc = `/images/${title.toLowerCase().replace(/ /g, '-')}.png`;
    const [newCourse] = await db.insert(courses).values({
      title,
      imageSrc,
    }).returning();

    if (!newCourse) throw new Error("Failed to create course");
    console.log('Created course:', newCourse);

    // Create the unit
    const [newUnit] = await db.insert(units).values({
      title,
      description: `Learn about ${title} and related technologies`,
      courseId: newCourse.id,
      order: 1,
    }).returning();

    if (!newUnit) throw new Error("Failed to create unit");
    console.log('Created unit:', newUnit);

    // Create lessons and fetch their sub LOs
    const newLessons = [];
    for (let i = 0; i < learningObjects.length; i++) {
      const lo = learningObjects[i];
      console.log(`\nProcessing learning object ${i + 1}/${learningObjects.length}:`, lo);
      
      // Create the lesson
      const [lesson] = await db.insert(lessons).values({
        title: lo.name,
        unitId: newUnit.id,
        order: i + 1,
      }).returning();

      if (!lesson) {
        console.error('Failed to create lesson for:', lo.name);
        continue;
      }
      
      console.log('Created lesson:', lesson);
      newLessons.push(lesson);

      // Fetch sub LOs for this learning object
      console.log(`Fetching sub LOs for learning object ${lo.lo_id}...`);
      const subLOs = await fetchSubLOs(lo.lo_id);
      console.log(`Found ${subLOs.length} sub LOs:`, subLOs);
      
      // Process each sub LO as a challenge
      for (let j = 0; j < subLOs.length; j++) {
        const subLO = subLOs[j];
        console.log(`\nProcessing sub LO ${j + 1}/${subLOs.length}:`, subLO);

        try {
          if (subLO.reference) {
            // Try to find existing challenge
            console.log(`Looking for existing challenge with ID ${subLO.reference}`);
            const existingChallenges = await db.select()
              .from(challenges)
              .where(eq(challenges.id, parseInt(subLO.reference)));

            if (existingChallenges.length > 0) {
              // Update existing challenge to link it to this lesson
              await db.update(challenges)
                .set({ 
                  lessonId: lesson.id,
                  order: j + 1
                })
                .where(eq(challenges.id, parseInt(subLO.reference)));
              
              console.log(`Linked existing challenge ${subLO.reference} to lesson ${lesson.id}`);
            } else {
              console.log(`Warning: Referenced challenge ${subLO.reference} not found`);
            }
          } else {
            // Create new challenge
            console.log('Creating new challenge for:', subLO.name);
            const [newChallenge] = await db.insert(challenges).values({
              lessonId: lesson.id,
              type: 'TEXT', // Default type, should be mapped from subLO type
              label: subLO.name,
              order: j + 1,
              explanation: subLO.material || undefined,
            }).returning();

            if (newChallenge) {
              console.log('Created new challenge:', newChallenge);
            }
          }
        } catch (error) {
          console.error(`Error processing sub LO for lesson ${lesson.id}:`, error);
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
