import { useState, useEffect } from "react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import GameHeader from "@/components/GameHeader";
import PromptCard from "@/components/PromptCard";
import HintWords from "@/components/HintWords";
import TimerControl from "@/components/TimerControl";
import GameComplete from "@/components/GameComplete";
import HelpModal from "@/components/HelpModal";
import { Prompt, CEFRLevel, Topic, GamePrompts } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function GamePage() {
  const [, params] = useRoute("/game");
  const searchParams = new URLSearchParams(window.location.search);
  const level = searchParams.get("level") as CEFRLevel || "B1";
  const topicId = searchParams.get("topic") || "1";
  
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showComplete, setShowComplete] = useState<boolean>(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch topic by ID for the header
  const { data: topic, isLoading: isTopicLoading } = useQuery<Topic>({
    queryKey: [`/api/topics/${topicId}`]
  });

  // Fetch prompts based on level and topic
  const { data: promptsData, isLoading: isPromptsLoading, error } = useQuery<GamePrompts>({
    queryKey: [`/api/prompts?level=${level}&topicId=${topicId}`]
  });

  // Log the current state for debugging
  useEffect(() => {
    console.log("GamePage state:", { 
      level, 
      topicId, 
      topic,
      promptsData,
      isLoading: { topic: isTopicLoading, prompts: isPromptsLoading },
      error
    });
  }, [level, topicId, topic, promptsData, isTopicLoading, isPromptsLoading, error]);

  const handleNext = () => {
    if (currentStage < 2) {
      setCurrentStage(prev => prev + 1);
      setTimeRemaining(30);
      setTimerRunning(true);
    } else {
      setShowComplete(true);
    }
  };

  const handleToggleTimer = () => {
    setTimerRunning(prev => !prev);
  };

  const handleRestart = () => {
    navigate("/");
  };

  const handleNewTopic = () => {
    navigate("/");
  };

  const getCurrentPrompt = (): Prompt | undefined => {
    if (!promptsData || !promptsData.stages) return undefined;
    return promptsData.stages[currentStage];
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timerRunning && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [timerRunning, timeRemaining]);

  if (isPromptsLoading || isTopicLoading) {
    return (
      <div className="bg-[#f5f7fa] min-h-screen font-['Nunito']">
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-[#3498db] text-3xl">
                <i className="fas fa-comments"></i>
              </span>
              <h1 className="font-['Quicksand'] font-bold text-2xl md:text-3xl text-[#333333]">
                <span className="text-[#3498db]">Ask</span>,
                <span className="text-[#f39c12]">Tell</span>,
                <span className="text-[#9b59b6]">Reveal</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-[#333333] hover:text-[#3498db] transition-colors">
                <i className="fas fa-question-circle text-xl"></i>
              </button>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center my-10">
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-xl mb-6" />
            <Skeleton className="h-12 w-3/4 rounded-xl mb-4" />
            <div className="flex gap-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-24 rounded-lg" />
                <Skeleton className="h-10 w-24 rounded-lg" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f5f7fa] min-h-screen font-['Nunito'] flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h2 className="font-['Quicksand'] font-bold text-xl mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">We couldn't load your speaking prompts. Please try again.</p>
          <button 
            onClick={() => navigate("/")}
            className="bg-[#3498db] hover:bg-[#3498db]/90 text-white font-semibold py-2 px-6 rounded-full transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentPrompt = getCurrentPrompt();

  return (
    <div className="bg-[#f5f7fa] min-h-screen font-['Nunito']">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-[#3498db] text-3xl">
              <i className="fas fa-comments"></i>
            </span>
            <h1 className="font-['Quicksand'] font-bold text-2xl md:text-3xl text-[#333333]">
              <span className="text-[#3498db]">Ask</span>,
              <span className="text-[#f39c12]">Tell</span>,
              <span className="text-[#9b59b6]">Reveal</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="text-[#333333] hover:text-[#3498db] transition-colors"
              onClick={() => setShowHelpModal(true)}
            >
              <i className="fas fa-question-circle text-xl"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!showComplete ? (
            <>
              <GameHeader 
                level={level}
                topic={topic?.name || "Topic"}
                currentStage={currentStage}
              />

              {currentPrompt && (
                <motion.div
                  key={currentStage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PromptCard 
                    prompt={currentPrompt}
                    isLoading={false}
                  />

                  <HintWords 
                    words={currentPrompt.hintWords}
                  />
                
                  <TimerControl 
                    timeRemaining={timeRemaining}
                    timerRunning={timerRunning}
                    onToggleTimer={handleToggleTimer}
                    onNext={handleNext}
                  />
                </motion.div>
              )}
            </>
          ) : (
            <GameComplete 
              onRestart={handleRestart}
              onNewTopic={handleNewTopic}
            />
          )}
        </div>
      </main>

      <HelpModal 
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
}
