"use client";
import { quizOptions, challenges } from "@/db/schema";
import { useState } from "react";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { MultiChoices } from "./multible-choice";
import { Footer } from "./footer";

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
  const [hearts, setHearts] = useState(initialHearts);
  const [percentage, setPercentage] = useState(initialPercentage);

  const [challenges] = useState(initialLessonChallenges);
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex(
      (challenge) => !challenge.completed
    );
    return uncompletedIndex === -1 ? 0 : uncompletedIndex; // Find the first uncompleted challenge or default to 0
  });

  const challenge = challenges[activeIndex];

  const [selectedOption, setSelectedOption] = useState<number | undefined>();
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");
  const options = challenge?.quizOptions ?? [];

  const onSelect = (id: number) => {
    if (status !== "none") return; // إذا كانت الحالة ليست "none"، لا تنفذ الكود التالي
    setSelectedOption(id); // تعيين الـ id المحدد
  };

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
                    status={status} // TODO: Set the correct status
                    selectedOption={selectedOption}
                    disabled={false}
                    type={challenge.type}
                  />
                  <Footer
                    disabled={!selectedOption}
                    status={status}
                    onCheck={() => {}}
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
