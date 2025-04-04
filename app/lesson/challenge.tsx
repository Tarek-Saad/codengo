"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), {
  ssr: false
});
import { quizOptions, challenges } from "@/db/schema";
import { toast } from "sonner";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { MultiChoices } from "./multible-choice";
import { Footer } from "./footer";
import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { reduceHearts } from "@/actions/user-progress";
import { useAudio, useWindowSize, useMount } from "react-use";
import { ResultCard } from "./result-card";
import { useRouter } from "next/navigation";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { usePracticeModal } from "@/store/use-practice-modal";
import { TextChallenge } from "./text-challenge";
import { ImageChallenge } from "./image-challenge";

type Props = {
  initialPercentage: number;
  initialHearts: number;
  initialLessonId: number;
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    quizOptions: (typeof quizOptions.$inferSelect)[];
  })[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userSubscription: any;
};

export const Challenge = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
  userSubscription,
}: Props) => {
  const { open: openHeartsModal } = useHeartsModal();
  const { open: openPracticeModal } = usePracticeModal();

  useMount(() => {
    if (initialPercentage === 100) {
      openPracticeModal();
    }
  });

  const { width, height } = useWindowSize();
  const router = useRouter();

  const [finishAudio] = useAudio({ src: "/finish.mp3", autoPlay: true });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [correctAudio, _c, correctControls] = useAudio({ src: "/correct.wav" });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [incorrectAudio, _i, incorrectControls] = useAudio({
    src: "/incorrect.wav",
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [audio, controls] = useAudio({ src: "/correct.wav" });


  const [pending, startTransition] = useTransition();

  // used in final screen
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lessonId, setLessonId] = useState(initialLessonId);

  const [hearts, setHearts] = useState(initialHearts);
  const [percentage, setPercentage] = useState(() => {
    return initialPercentage === 100 ? 0 : initialPercentage;
  });

  const [challenges] = useState(initialLessonChallenges);
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex(
      (challenge) => !challenge.completed
    );
    return uncompletedIndex === -1 ? 0 : uncompletedIndex; // Find the first uncompleted challenge or default to 0
  });

  const challenge = challenges[activeIndex];
  console.log(challenges);

  const handleTextComplete = () => {
    startTransition(() => {
      upsertChallengeProgress(challenge.id)
        .then((response) => {
          if (response?.error === "hearts") {
            openHeartsModal();
            return;
          }
          correctControls.play();
          setPercentage((prev) => prev + 100 / challenges.length);
          onNext();
        })
        .catch(() => {
          toast.error("Something went wrong!");
        });
    });
  };

  // Quiz functionalities
  const [selectedOption, setSelectedOption] = useState<number | undefined>();

  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");
  const options = challenge?.quizOptions ?? [];

  const onNext = () => {
    setActiveIndex((current) => current + 1);
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;
    setSelectedOption(id);
  };

  const onContinue = () => {
    console.log(selectedOption);
    if (!selectedOption) return;

    if (status === "wrong") {
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }
    const correctOption = options.find((option) => option.correct);

    if (!correctOption) {
      return;
    }

    if (correctOption.id === selectedOption) {
      console.log("Correct option!");
      startTransition(() => {
        upsertChallengeProgress(challenge.id)
          .then((response) => {
            if (response?.error === "hearts") {
              openHeartsModal();
              return;
            }

            correctControls.play();
            setStatus("correct");

            setPercentage((prev) => prev + 100 / challenges.length);
            console.log("Percentage:", percentage);

            // This is a practice
            if (initialPercentage === 100) {
              setHearts((prev) => Math.min(prev + 1, 5));
            }
          })
          .catch(() => {
            toast.error("Something went wrong!");
          });
      });
    } else {
      startTransition(() => {
        reduceHearts(challenge.id)
          .then((response) => {
            if (response?.error === "hearts") {
              openHeartsModal();
              return;
            }

            incorrectControls.play();
            setStatus("wrong");

            if (!response?.error) {
              setHearts((prev) => Math.max(prev - 1, 0));
            }
          })
          .catch(() => {
            toast.error("Something went wrong. Please try again.");
          });
      });
    }
  };

  // Render image challenge if type is IMAGE
  if (challenge && challenge.type === "IMAGE" && challenge.imageContent) {
    return (
      <div className="h-full">
        <Header
          hearts={hearts}
          percentage={percentage}
          hasActiveSubscription={!!userSubscription}
        />
        <div className="flex-1 h-full">
          <ImageChallenge
            content={challenge.imageContent}
            onComplete={handleTextComplete}
          />
        </div>
      </div>
    );
  }

  // Render text challenge if type is TEXT
  if (challenge && challenge.type === "TEXT" && challenge.textContent) {
    return (
      <div className="h-full">
        <Header
          hearts={hearts}
          percentage={percentage}
          hasActiveSubscription={!!userSubscription}
        />
        <div className="flex-1 h-full">
          <TextChallenge
            content={challenge.textContent}
            onComplete={handleTextComplete}
          />
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <>
        {finishAudio}
        {typeof window !== 'undefined' && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            tweenDuration={10000}
          />
        )}

        <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full">
          <Image
            src="/finish.svg"
            alt="Finish"
            className="hidden lg:block"
            height={100}
            width={100}
          />
          <Image
            src="/finish.svg"
            alt="Finish"
            className="block lg:hidden"
            height={50}
            width={50}
          />
          <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
            Great job! <br /> You&apos;ve completed the lesson.
          </h1>

          <div className="flex items-center gap-x-4 w-full">
            <ResultCard variant="points" value={challenges.length * 10} />
            <ResultCard variant="hearts" value={hearts} />
          </div>
        </div>

        <Footer
          lessonId={lessonId}
          status="completed"
          onCheck={() => router.push("/learn")}
        />
      </>
    );
  }

  // تحديد عنوان التحدي بناءً على نوعه
  let title: string;
  switch (challenge.type) {
    case "ASSIST":
      title = "Select the correct meaning";
      break;
    case "SELECT":
      title = "Choose the correct option";
      break;
    case "CODE":
      title = "Write the correct code";
      break;
    case "VIDEO":
      title = "Watch the video";
      break;
    case "TEXT":
      title = "Read the text";
      break;
    default:
      title = challenge.label; // إذا كان النوع غير معروف
  }

  return (
    <>
      {incorrectAudio}
      {correctAudio}
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
      />

      <div className="flex-1">
        <div className="h-full flex items-center justify-center">
          <div className="lg:min-h-[400px] lg:w-[1000px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
            <h1 className="text-md lg:text-xl text-center lg:text-start font-bold text-neutral-700">
              {title}
            </h1>
            <div>
              {challenge.type === "SELECT" && (
                <>
                  <QuestionBubble question={challenge.label} />
                  <MultiChoices
                    options={options}
                    onSelect={onSelect}
                    status={status}
                    selectedOption={selectedOption}
                    disabled={pending}
                    type={challenge.type}
                  />
                  <Footer
                    disabled={pending || !selectedOption}
                    status={status}
                    onCheck={onContinue}
                    explanation={status === "correct" ? challenge.explanation : undefined}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
