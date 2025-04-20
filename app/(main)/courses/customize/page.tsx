'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AnalysisResponse {
  knowledge_base: string[];
  learning_goal: string[];
}

export default function CustomizeCourse() {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input');
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState({
    user_knowledge: '',
    user_goal: ''
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);

  const handleAnalyze = async () => {
    try {
      setError(null);
      setStep('analyzing');
      // Log the request payload for debugging
      console.log('Sending request with:', userInput);
      
      const response = await fetch('https://iia-one.vercel.app/learning-analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        credentials: 'include',
        body: JSON.stringify({
          user_knowledge: userInput.user_knowledge.trim() || 'None',
          user_goal: userInput.user_goal.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', response.status, errorData);
        throw new Error(`Analysis failed: ${response.status} ${errorData}`);
      }
      
      const data = await response.json();
      setAnalysisResult(data);
      setStep('result');
    } catch (error) {
      console.error('Analysis error:', error);
      setStep('input');
      setError('Failed to analyze your input. Please try again.');
    }
  };

  if (step === 'analyzing') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <Image
            src="/mascot.png" // Make sure to add your mascot image
            alt="CodeNGo Mascot"
            width={120}
            height={120}
            className="mx-auto"
          />
        </div>
        <div className="animate-pulse">
          <h2 className="text-2xl font-bold mb-4">Analyzing your inputs..</h2>
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-8">
            <Image
              src="/mascot.png" // Make sure to add your mascot image
              alt="CodeNGo Mascot"
              width={80}
              height={80}
              className="rounded-full"
            />
            <h1 className="text-2xl font-bold">Your Personalized Learning Plan</h1>
          </div>

          <div className="space-y-6">
            <div className="bg-green-50 p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Detected Knowledge Base
              </h2>
              <ul className="list-disc list-inside space-y-2">
                {analysisResult?.knowledge_base.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}              
              </ul>
            </div>

            <div className="bg-yellow-50 p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                What you will be learning
              </h2>
              <div className="space-y-2">
                {analysisResult?.learning_goal.map((goal, index) => (
                  <div key={index} className="bg-yellow-400 text-white px-4 py-2 rounded-lg inline-block">
                    {goal}
                  </div>
                ))}              
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={() => setStep('input')}>Not right? Try again</Button>
            <Button variant="secondary" onClick={() => router.push('/courses')}>Continue</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-green-400 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Les customize your learning path!</h1>
        <p className="text-green-50 mb-8">Tell us what you know & where you wanna go</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">What do you already know?</label>
            <input
              type="text"
              placeholder="E.g. I know Python... (it's okay to leave blank)"
              className="w-full p-4 rounded-xl bg-white/90 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={userInput.user_knowledge}
              onChange={(e) => setUserInput(prev => ({ ...prev, user_knowledge: e.target.value }))}
            />
            {error && <p className="mt-2 text-red-200 text-sm">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">What is your tech goal?</label>
            <input
              type="text"
              placeholder="E.g. I want to build backend websites"
              className="w-full p-4 rounded-xl bg-white/90 text-gray-800 placeholder-gray-400"
              value={userInput.user_goal}
              onChange={(e) => setUserInput(prev => ({ ...prev, user_goal: e.target.value }))}
            />
          </div>

          <Button
            onClick={handleAnalyze}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!userInput.user_goal.trim()}
          >
            ANALYZE!
          </Button>
        </div>
      </div>
    </div>
  );
}
