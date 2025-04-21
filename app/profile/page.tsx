"use client";
import dynamic from "next/dynamic";

const LearningStyleQuiz = dynamic(
  () => import("@/components/LearningStyleQuiz"),
  { ssr: false }
);

const ProfilePage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Learning Style Assessment</h1>
      <LearningStyleQuiz />
    </div>
  );
};

export default ProfilePage;
