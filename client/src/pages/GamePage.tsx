import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import GameHeader from "@/components/GameHeader";
import PromptCard from "@/components/PromptCard";
import HintWords from "@/components/HintWords";
import GameComplete from "@/components/GameComplete";
import HelpModal from "@/components/HelpModal";
import { Prompt, CEFRLevel, Topic, GamePrompts } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

// Function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function GamePage() {
  const [, params] = useRoute("/game");
  const searchParams = new URLSearchParams(window.location.search);
  const level = searchParams.get("level") as CEFRLevel || "B1";
  const topicId = searchParams.get("topic") || "1";
  
  // Store a randomized sequence of stages (0, 1, 2 shuffled)
  const [stageSequence, setStageSequence] = useState<number[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showComplete, setShowComplete] = useState<boolean>(false);
  const [wantNewPrompts, setWantNewPrompts] = useState<boolean>(false);
  const [promptsCounter, setPromptsCounter] = useState<number>(0); // Counter to force refetch
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch topic by ID for the header
  const { data: topic, isLoading: isTopicLoading } = useQuery<Topic>({
    queryKey: [`/api/topics/${topicId}`]
  });

  // Continue parameter is set to true when user wants to continue with new prompts
  const [continuePractice, setContinuePractice] = useState<boolean>(false);
  
  // Fetch prompts based on level and topic
  // Include continue=true parameter when user wants fresh prompts
  const { data: promptsData, isLoading: isPromptsLoading, error, refetch } = useQuery<GamePrompts>({
    queryKey: [`/api/prompts?level=${level}&topicId=${topicId}&counter=${promptsCounter}&continue=${continuePractice}`]
  });

  // Initialize or refresh stage sequence when prompts data is loaded or when requesting new prompts
  useEffect(() => {
    if (promptsData?.stages && (stageSequence.length === 0 || wantNewPrompts)) {
      // Create a new randomized sequence
      setStageSequence(shuffleArray([0, 1, 2]));
      setCurrentStageIndex(0);
      setWantNewPrompts(false);
      
      // Reset continue flag after successful fetch
      if (continuePractice) {
        setContinuePractice(false);
        console.log("Reset continuePractice flag after successful fetch of new prompts");
      }
      
      // Log the new sequence for debugging
      console.log("New randomized stage sequence created");
    }
  }, [promptsData, wantNewPrompts, continuePractice]);

  // Log the current state for debugging
  useEffect(() => {
    console.log("GamePage state:", { 
      level, 
      topicId, 
      topic,
      promptsData,
      stageSequence,
      currentStageIndex,
      currentStage: stageSequence[currentStageIndex],
      isLoading: { topic: isTopicLoading, prompts: isPromptsLoading },
      error
    });
  }, [level, topicId, topic, promptsData, stageSequence, currentStageIndex, isTopicLoading, isPromptsLoading, error]);

  const handleNext = useCallback(() => {
    if (currentStageIndex < stageSequence.length - 1) {
      // Move to the next stage in our sequence
      setCurrentStageIndex(prev => prev + 1);
    } else if (wantNewPrompts) {
      // We're waiting for new prompts to load
      console.log("Ready for new prompts");
    } else {
      // We've completed all stages in the current sequence
      // Instead of showing "complete", ask if they want to continue with new prompts
      setWantNewPrompts(true);
    }
  }, [currentStageIndex, stageSequence, wantNewPrompts]);

  const handleContinue = () => {
    // Increment the counter to force a new fetch
    const newCounter = promptsCounter + 1;
    setPromptsCounter(newCounter);
    
    // Set continue flag to true to force fresh prompts
    setContinuePractice(true);
    
    // Flag that we want new prompts to update the sequence
    setWantNewPrompts(true);
    
    // Explicitly force a refetch
    refetch();
    
    // Log what we're doing
    console.log(`Continuing with new prompts - forcing a refetch with continue=true and counter=${newCounter}`);
  };

  const handleEndActivity = () => {
    setShowComplete(true);
  };

  const handleRestart = () => {
    navigate("/");
  };

  const handleNewTopic = () => {
    navigate("/");
  };

  const getCurrentPrompt = (): Prompt | undefined => {
    if (!promptsData?.stages || stageSequence.length === 0) return undefined;
    const stageIndex = stageSequence[currentStageIndex];
    return promptsData.stages[stageIndex];
  };

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
                currentStage={currentPrompt?.stage || ""}
                stageIndex={currentStageIndex}
                totalStages={stageSequence.length}
              />

              {wantNewPrompts ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-md p-6 text-center"
                >
                  <div className="mb-6">
                    <div className="text-3xl text-[#3498db] mb-4">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h3 className="font-['Quicksand'] font-bold text-xl mb-2">
                      Great job!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You've completed this set of prompts. Would you like to continue with a new set of randomized prompts or end this practice session?
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={handleContinue}
                      className="bg-[#3498db] hover:bg-[#3498db]/90 text-white font-semibold px-6 py-2 rounded-full"
                    >
                      <i className="fas fa-redo mr-2"></i> Continue Practice
                    </Button>
                    <Button
                      onClick={handleEndActivity}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold px-6 py-2 rounded-full"
                    >
                      <i className="fas fa-check mr-2"></i> End Session
                    </Button>
                  </div>
                </motion.div>
              ) : currentPrompt ? (
                <motion.div
                  key={`${currentStageIndex}-${currentPrompt.stage}`}
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
                
                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={handleNext}
                      className="bg-[#3498db] hover:bg-[#3498db]/90 text-white font-semibold px-6 py-2 rounded-full"
                    >
                      Next <i className="fas fa-arrow-right ml-2"></i>
                    </Button>
                  </div>
                </motion.div>
              ) : null}
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
