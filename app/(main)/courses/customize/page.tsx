'use client';

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { createCourse } from "../actions";

type ChallengeType = "SELECT" | "ASSIST" | "CODE" | "VIDEO" | "TEXT" | "IMAGE" | "PDF" | "COMPLETE" | "WRITE" | "PROJECT";

interface PathLearningObject {
  lo_id: number;
  name: string;
  type: string;
}

interface MappedLearningObject {
  lo_id: number;
  name: string;
  type: ChallengeType;
}

interface AnalysisResponse {
  knowledge_base: string[];
  learning_goal: string[];
}

export default function CustomizeCourse() {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'analyzing' | 'result' | 'generating'>('input');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
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

  if (step === 'analyzing' || step === 'generating') {
    console.log('Analyzing...');
    console.log('User Input:', userInput);
    console.log('Analysis Result:', analysisResult);

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">Analyzing your input...</p>
          </div>
        )}

        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-8 bg-white rounded-xl shadow-lg">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
                Generating Your Personalized Course
              </h2>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-semibold">Email:</span> {user?.emailAddresses?.[0]?.emailAddress}</p>
                <p><span className="font-semibold">Goal:</span> {analysisResult?.learning_goal?.[0]}</p>
                <p><span className="font-semibold">Knowledge Base:</span> {analysisResult?.knowledge_base?.join(', ') || 'Introduction to Programming'}</p>
              </div>
              <p className="mt-6 text-gray-700">
                We&apos;re crafting a personalized learning path tailored to your experience and goals.
                This may take a moment as we ensure the perfect course selection for you.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 'result') {
    console.log(analysisResult);

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
            <Button 
              variant="secondary" 
              onClick={async () => {
                try {
                  // Ensure we have valid data for the API
                  if (!analysisResult?.learning_goal?.[0]) {
                    throw new Error('No learning goal detected from analysis');
                  }

                  if (!user?.emailAddresses?.[0]?.emailAddress) {
                    throw new Error('Please sign in with an email address');
                  }

                  const requestPayload = {
                    learner_email: user.emailAddresses[0].emailAddress,
                    learning_goals: [analysisResult.learning_goal[0]],
                    // If no knowledge base, use a default one
                    knowledge_base: analysisResult.knowledge_base?.length ? 
                      analysisResult.knowledge_base : 
                      ['Introduction to Programming']
                  };

                  setStep('generating');
                  setIsLoading(true);

                  try {
                    const response = await fetch('https://iia-one.vercel.app/api/selection/best-path', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                    },
                    body: JSON.stringify(requestPayload)
                  });

                  if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error:', response.status, errorText);
                    throw new Error(`Failed to get best path: ${response.status} ${errorText}`);
                  }

                    const pathData = await response.json();
                    console.log('Best Path Result:', pathData);
                    
                    // Map the learning object types to our challenge types
                    const typeMapping: Record<string, ChallengeType> = {
                      "introVideo": "VIDEO",
                      "realWorld": "PROJECT",
                      "quiz": "SELECT",
                      "introArticle": "TEXT",
                      "writeCode": "CODE",
                      "SBSVideo": "VIDEO",
                      "supportArticle": "TEXT",
                      "finalAssignment": "PROJECT",
                      "instructuinVideo": "VIDEO",
                      "PDFGuide": "PDF",
                      "HowTo-video/PDF": "VIDEO",
                      "exerciseTask": "CODE",
                      "tutorial-video/PDF": "VIDEO",
                      "summary": "TEXT",
                      "interactiveDemo": "ASSIST"
                    };

                    console.log('Learning Objects:', pathData.learning_objects);
                    
                    // Map the learning objects and ensure they have the correct type
                    const mappedObjects = pathData.learning_objects.map((obj: PathLearningObject) => ({
                      lo_id: obj.lo_id,
                      name: obj.name,
                      type: typeMapping[obj.type] || "TEXT" // Default to TEXT if type not found
                    }));
                    
                    console.log('Mapped Learning Objects:', mappedObjects);
                    
                    // Get the course title from the last learning object name
                    const courseTitle = mappedObjects[mappedObjects.length - 1]?.name || 'New Course';
                    
                    // Create the course with unit and lessons
                    const result = await createCourse(courseTitle, mappedObjects);
                    
                    if (!result.course) {
                      throw new Error('Failed to create course');
                    }
                    
                    console.log('Created course structure:', result);

                    // Navigate to courses page
                    router.push('/courses');
                  } catch (error) {
                    console.error('Error:', error);
                    setError(error instanceof Error ? error.message : 'Failed to generate learning path');
                    throw error;
                  } finally {
                    setIsLoading(false);
                  }
                } catch (error) {
                  console.error('Error getting best path:', error);
                  setError(error instanceof Error ? error.message : 'Failed to generate learning path. Please try again.');
                }
              }}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 relative">
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
            <p className="text-lg font-medium text-gray-700">Generating your personalized learning path...</p>
          </div>
        </div>
      )}
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
