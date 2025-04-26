'use server';

import db from "@/db/drizzle";
import { courses, units, lessons, challenges, quizOptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

const subLOTypeToChallenge: Record<string, ChallengeType> = {
  'introArticle': 'TEXT',
  'writeCode': 'SELECT',
  'quiz': 'SELECT',
  'SBSVideo': 'VIDEO',
  'supportArticle': 'TEXT',
  'finalAssignment': 'PROJECT',
  'HowTo-video/PDF': 'PDF',
  'exerciseTask': 'SELECT',
  'tutorial-video/PDF': 'PDF',
  'interactiveDemo': 'SELECT',
  'pdf': 'PDF'
};

type ChallengeType = 'SELECT' | 'ASSIST' | 'CODE' | 'VIDEO' | 'TEXT' | 'IMAGE' | 'PDF' | 'COMPLETE' | 'WRITE' | 'PROJECT';

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
    const newLessons: typeof lessons.$inferSelect[] = [];
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
            try {
              const referenceId = parseInt(subLO.reference);
              if (isNaN(referenceId)) {
                throw new Error(`Invalid reference ID: ${subLO.reference}`);
              }

              // Find the existing challenge
              const existingChallenge = await db.query.challenges.findFirst({
                where: eq(challenges.id, referenceId),
              });

              if (existingChallenge) {
                console.log(`Found existing challenge ${existingChallenge.id}, copying to lesson ${lesson.id}`);
                
                // Create a new challenge with the same content as the referenced one
                const [newChallenge] = await db.insert(challenges).values({
                  lessonId: lesson.id,
                  type: existingChallenge.type as ChallengeType,
                  label: existingChallenge.label || subLO.name,
                  order: j + 1,
                  explanation: existingChallenge.explanation || subLO.material,
                  textContent: existingChallenge.textContent,
                  videoURL: existingChallenge.videoURL,
                  imageContent: existingChallenge.imageContent,
                  pdfURL: existingChallenge.pdfURL,
                  initialCode: existingChallenge.initialCode,
                  language: existingChallenge.language,
                  testCases: existingChallenge.testCases,
                  projectStructure: existingChallenge.projectStructure,
                  projectFiles: existingChallenge.projectFiles,
                  completeQuestion: existingChallenge.completeQuestion,
                }).returning();
                
                if (newChallenge) {
                  console.log(`Created new challenge ${newChallenge.id} based on ${referenceId}`);
                  
                  // If it's a SELECT challenge, copy the quiz options
                  if (existingChallenge.type === 'SELECT') {
                    const existingOptions = await db.select().from(quizOptions)
                      .where(eq(quizOptions.challengeId, referenceId));
                    
                    if (existingOptions.length > 0) {
                      const quizOptionsData = existingOptions.map(option => ({
                        challengeId: newChallenge.id,
                        text: option.text,
                        correct: option.correct,
                        order: option.order,
                        imageSrc: option.imageSrc,
                        audioSrc: option.audioSrc,
                      }));
                      
                      await db.insert(quizOptions).values(quizOptionsData);
                      console.log(`Copied ${quizOptionsData.length} quiz options from challenge ${referenceId} to ${newChallenge.id}`);
                    }
                  }
                }
                
                continue;
              } else {
                console.log(`Warning: Referenced challenge ${subLO.reference} not found, creating new challenge`);
                throw new Error('Challenge not found');
              }
            } catch (error) {
              console.error(`Error handling reference ${subLO.reference}:`, error);
            }
          }
          
          // Create new challenge (either because there's no reference or reference handling failed)
          console.log('Creating new challenge for:', subLO.name);
          const challengeType = subLOTypeToChallenge[subLO.name] || 'TEXT';
          console.log('Mapped challenge type:', challengeType);
          
          // Prepare base challenge data
          const baseData = {
            lessonId: lesson.id,
            type: challengeType,
            label: subLO.name,
            order: j + 1,
            explanation: subLO.material || undefined,
          };

          // Add specific fields based on challenge type
          let challengeData;
          if (challengeType === 'CODE') {
            challengeData = {
              ...baseData,
              initialCode: '// Write your code here',
              language: 'javascript',
              testCases: '[]',
            };
          } else if (challengeType === 'VIDEO') {
            challengeData = {
              ...baseData,
              videoURL: 'https://example.com/video',
            };
          } else if (challengeType === 'PROJECT') {
            challengeData = {
              ...baseData,
              projectStructure: '[]',
              projectFiles: '{}',
            };
          } else if (challengeType === 'SELECT') {
            challengeData = {
              ...baseData,
              textContent: subLO.material || 'Select the correct answer',
            };

            // Create the challenge first
            const [newChallenge] = await db.insert(challenges).values(challengeData).returning();
            
            if (newChallenge) {
              console.log('Created new SELECT challenge:', newChallenge);
              
              let quizOptionsData;
              
              // Check if the referenced challenge has quiz options
              if (subLO.reference) {
                const referenceId = parseInt(subLO.reference);
                if (!isNaN(referenceId)) {
                  // Get quiz options from referenced challenge
                  const existingOptions = await db.select().from(quizOptions)
                    .where(eq(quizOptions.challengeId, referenceId));

                  if (existingOptions.length > 0) {
                    // Copy existing options for the new challenge
                    quizOptionsData = existingOptions.map(option => ({
                      challengeId: newChallenge.id,
                      text: option.text,
                      correct: option.correct,
                      order: option.order,
                      imageSrc: option.imageSrc,
                      audioSrc: option.audioSrc,
                    }));
                    console.log('Using quiz options from reference challenge:', referenceId);
                  }
                }
              }

              // If no existing options found or no reference, create default options
              if (!quizOptionsData) {
                quizOptionsData = [
                  { text: 'Option 1', correct: true, order: 1 },
                  { text: 'Option 2', correct: false, order: 2 },
                  { text: 'Option 3', correct: false, order: 3 },
                  { text: 'Option 4', correct: false, order: 4 },
                ].map(option => ({
                  ...option,
                  challengeId: newChallenge.id
                }));
                console.log('Using default quiz options');
              }

              // Insert the quiz options
              await db.insert(quizOptions).values(quizOptionsData);
              console.log(`Created ${quizOptionsData.length} quiz options for challenge:`, newChallenge.id);
            }

            // Skip the general challenge creation since we already created it
            continue;
          } else {
            challengeData = baseData;
          }

          const [newChallenge] = await db.insert(challenges).values(challengeData).returning();

          if (newChallenge) {
            console.log('Created new challenge:', newChallenge);
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
