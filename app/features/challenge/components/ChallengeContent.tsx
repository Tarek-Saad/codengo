"use client";

import { useChallengeContext } from "../contexts/ChallengeContext";
import { MultiChoices } from "@/app/lesson/multible-choice";
import { WriteChallenge } from "@/app/lesson/write-challenge";
import { CodeChallenge } from "@/app/lesson/code-challenge";
import { CompleteChallenge } from "@/app/lesson/complete-challenge";
import { ImageChallenge } from "@/app/lesson/image-challenge";
import { VideoChallenge } from "@/app/lesson/video-challenge";
import { PdfChallenge } from "@/app/lesson/pdf-challenge";
import ProjectV3Challenge from "@/app/lesson/projectv3-challenge";
import { QuestionBubble } from "@/app/lesson/question-bubble";
import { useChallengeProgress } from "../hooks/useChallengeProgress";
import { Challenge } from "../types";
import { TextChallenge } from "@/app/lesson/text-challenge";
import { Footer } from "@/app/lesson/footer";
import { getChallengeTitle } from "./utils/getChallengeTitle";



interface ChallengeContentProps {
  challenge: Challenge;
  initialPercentage: number;
  challengesLength: number;
  onComplete?: () => void;
}

export const ChallengeContent = ({ 
  challenge,
  initialPercentage,
  challengesLength,
  onComplete
}: ChallengeContentProps) => {
  const { status, selectedOption, onSelect } = useChallengeContext();
  const { pending, handleCorrectAnswer } = useChallengeProgress(
    challenge.id,
    initialPercentage,
    challengesLength,
    onComplete
  );

  const renderChallenge = () => {
    switch (challenge.type) {
      case "SELECT":
        if (!challenge.quizOptions || challenge.quizOptions.length === 0) {
          console.error('No quiz options found for challenge:', challenge.id);
          return null;
        }
        console.log('Rendering SELECT challenge:', challenge);
        return (
          <div className="flex flex-col items-center justify-center w-full h-full space-y-8">
            <QuestionBubble question={challenge.question} />
            <MultiChoices
              options={challenge.quizOptions.map(opt => ({
                ...opt,
                id: opt.id,
                text: opt.text || '',
                imageSrc: opt.imageSrc || "",
                audioSrc: opt.audioSrc || "",
                order: opt.order || 0
              }))}
              selectedOption={selectedOption}
              onSelect={onSelect}
              disabled={pending || status === "correct"}
              status={status}
              type={challenge.type}
            />
            <Footer
              disabled={pending || !selectedOption}
              status={status}
              onCheck={onComplete}
              explanation={status === "correct" ? challenge.explanation : undefined}
            />
          </div>
        );
      case "WRITE":
        return (
          <WriteChallenge
            words={challenge.wordOptions?.map(opt => ({
              id: opt.id,
              word: opt.word,
              order: opt.order,
              correct: opt.correct
            })) || []}
            question={challenge.completeQuestion || ""}
            onComplete={handleCorrectAnswer}
            disabled={status === "correct"}
          />
        );

      case "CODE":
        if (!challenge.initialCode) return null;
        try {
          const testCases = JSON.parse(challenge.testCases || "[]");
          return (
            <CodeChallenge
              initialCode={challenge.initialCode}
              instructions={challenge.instructions || ""}
              testCases={testCases}
              onComplete={handleCorrectAnswer}
              language={(challenge.language as "python" | "javascript" | "typescript") || "javascript"}
            />
          );
        } catch {
          return null;
        }

      case "COMPLETE":
        return (
          <CompleteChallenge
            words={challenge.wordOptions?.map(opt => ({
              id: opt.id,
              word: opt.word,
              order: opt.order,
              correct: opt.correct
            })) || []}
            question={challenge.completeQuestion || ""}
            onComplete={handleCorrectAnswer}
            disabled={status === "correct"}
          />
        );

      case "IMAGE":
        return challenge.imageContent ? (
          <ImageChallenge
            content={challenge.imageContent}
            onComplete={handleCorrectAnswer}
          />
        ) : null;

      case "VIDEO":
        return challenge.videoURL ? (
          <VideoChallenge
          content={challenge.videoURL || ""}
            onComplete={handleCorrectAnswer}
          />
        ) : null;

      case "PDF":
        return challenge.pdfURL ? (
          <PdfChallenge
            pdfUrl={challenge.pdfURL}
            onComplete={handleCorrectAnswer}
          />
        ) : null;

      case "PROJECT":
        return challenge.projectStructure ? (
          <div className="w-full h-[calc(100vh-12rem)]">
            <ProjectV3Challenge
              projectId={challenge.id.toString()}
              projectStructure={challenge.projectStructure}
              projectFiles={challenge.projectFiles || "{}"}
              language={challenge.language || "javascript"}
              disabled={status === "correct"}
            />
          </div>
        ) : null;

      case "TEXT":
        return challenge.textContent ? (
          <TextChallenge
            content={challenge.textContent}
            onComplete={handleCorrectAnswer}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-md lg:text-xl font-bold text-neutral-700 text-center mb-4">
        {getChallengeTitle(challenge)}
      </h1>
      {renderChallenge()}
    </div>
  );
};
