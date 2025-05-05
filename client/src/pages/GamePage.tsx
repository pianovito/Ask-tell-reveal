import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import GameHeader from "@/components/GameHeader";
import PromptCard from "@/components/PromptCard";
import HintWords from "@/components/HintWords";
import GameComplete from "@/components/GameComplete";
import HelpModal from "@/components/HelpModal";
import GroupAchievements from "@/components/GroupAchievements";
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
  const customTopic = searchParams.get("customTopic") || "";
  const isFreeMode = searchParams.get("freeMode") === "true";
  const isRandomMode = searchParams.get("randomMode") === "true";
  
  // Store a randomized sequence of stages (0, 1, 2 shuffled)
  const [stageSequence, setStageSequence] = useState<number[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showComplete, setShowComplete] = useState<boolean>(false);
  const [wantNewPrompts, setWantNewPrompts] = useState<boolean>(false);
  const [promptsCounter, setPromptsCounter] = useState<number>(0); // Counter to force refetch
  const [groupXP, setGroupXP] = useState<number>(0); // Track Group XP
  const [freeKeywords, setFreeKeywords] = useState<string[]>([]); // Keywords for free mode
  const [randomTopicId, setRandomTopicId] = useState<string>(topicId); // For Random Mode
  const [allTopics, setAllTopics] = useState<Topic[]>([]); // Store all topics for Random Mode
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch all topics for random mode
  const { data: topicsData, isLoading: isTopicsLoading } = useQuery<Topic[]>({
    queryKey: ['/api/topics'],
    enabled: isRandomMode // Only fetch all topics if in random mode
  });

  // Set all topics when the data is loaded
  useEffect(() => {
    if (topicsData && isRandomMode) {
      setAllTopics(topicsData);
      
      // If we have no randomTopicId set or we're initializing, pick a random topic
      if (randomTopicId === topicId || randomTopicId === "1") {
        const randomIndex = Math.floor(Math.random() * topicsData.length);
        const randomId = topicsData[randomIndex].id.toString();
        setRandomTopicId(randomId);
        console.log(`Random Mode: Selected random topic ID: ${randomId}`);
      }
    }
  }, [topicsData, isRandomMode, topicId, randomTopicId]);

  // Fetch topic by ID for the header (use randomTopicId in random mode)
  const { data: topic, isLoading: isTopicLoading } = useQuery<Topic>({
    queryKey: [`/api/topics/${isRandomMode ? randomTopicId : topicId}`]
  });

  // Continue parameter is set to true when user wants to continue with new prompts
  const [continuePractice, setContinuePractice] = useState<boolean>(false);
  
  // Fetch prompts based on level and topic
  // Include continue=true parameter when user wants fresh prompts
  // Add freeMode parameter to indicate we're in free mode
  // For Random Mode, use the randomTopicId
  // For Free Mode, include the customTopic parameter
  const queryParams = new URLSearchParams({
    level,
    topicId: isRandomMode ? randomTopicId : topicId,
    counter: promptsCounter.toString(),
    continue: continuePractice.toString(),
    freeMode: isFreeMode.toString()
  });
  
  // Add customTopic parameter only in Free Mode
  if (isFreeMode && customTopic) {
    queryParams.append('customTopic', customTopic);
  }
  
  const queryUrl = `/api/prompts?${queryParams.toString()}`;
  
  const { data: promptsData, isLoading: isPromptsLoading, error, refetch } = useQuery<GamePrompts>({
    queryKey: [queryUrl],
    // Enable the query for:
    // 1. Free Mode with custom topic
    // 2. Regular mode (not free mode, not random mode)
    // 3. Random Mode with a valid randomTopicId
    enabled: (isFreeMode && !!customTopic) || 
             (!isFreeMode && !isRandomMode) || 
             (!isFreeMode && isRandomMode && !!randomTopicId && randomTopicId !== "1")
  });

  // Initialize or refresh stage sequence when prompts data is loaded or when requesting new prompts
  useEffect(() => {
    // For free mode, we just need to initialize a randomized sequence
    if (isFreeMode && (stageSequence.length === 0 || wantNewPrompts)) {
      setStageSequence(shuffleArray([0, 1, 2]));
      setCurrentStageIndex(0);
      setWantNewPrompts(false);
      console.log("Free Mode: New randomized stage sequence created");
    }
    // For normal mode with prompts from the API
    else if (!isFreeMode && promptsData?.stages && (stageSequence.length === 0 || wantNewPrompts)) {
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
  }, [promptsData, wantNewPrompts, continuePractice, isFreeMode]);

  // Log the current state for debugging
  useEffect(() => {
    console.log("GamePage state:", { 
      level, 
      topicId, 
      topic,
      isRandomMode,
      randomTopicId,
      allTopics: allTopics.length,
      promptsData,
      stageSequence,
      currentStageIndex,
      currentStage: stageSequence[currentStageIndex],
      isLoading: { topic: isTopicLoading, topics: isTopicsLoading, prompts: isPromptsLoading },
      error
    });
  }, [level, topicId, topic, isRandomMode, randomTopicId, allTopics.length, promptsData, stageSequence, currentStageIndex, isTopicLoading, isTopicsLoading, isPromptsLoading, error]);

  const handleNext = useCallback(() => {
    if (currentStageIndex < stageSequence.length - 1) {
      // Move to the next stage in our sequence
      setCurrentStageIndex(prev => prev + 1);
      
      // In normal mode, generate new prompts after each stage to ensure variety
      if (!isFreeMode) {
        // Increment the counter to force a new fetch
        const newCounter = promptsCounter + 1;
        setPromptsCounter(newCounter);
        
        // Set continue flag to true to force fresh prompts on every "Next" click
        setContinuePractice(true);
        
        // Explicitly force a refetch but don't update the UI yet
        refetch();
        
        console.log(`Generating fresh prompts in the background after Next button click (counter=${newCounter})`);
      } else {
        console.log("Free mode: moving to next stage without prompts");
      }
    } else if (wantNewPrompts) {
      // We're waiting for new prompts to load
      console.log("Ready for new prompts");
    } else {
      // We've completed all stages in the current sequence
      
      // In Random Mode, pick a new topic right away instead of asking if they want to continue
      if (isRandomMode && allTopics.length > 1) {
        // Filter out current topic ID to avoid repeating
        const availableTopics = allTopics.filter(t => t.id.toString() !== randomTopicId);
        
        if (availableTopics.length > 0) {
          // Select a random topic from available ones
          const randomIndex = Math.floor(Math.random() * availableTopics.length);
          const newRandomTopicId = availableTopics[randomIndex].id.toString();
          
          // Update the random topic ID
          setRandomTopicId(newRandomTopicId);
          
          // Reset the stage sequence since we have a new topic
          setStageSequence(shuffleArray([0, 1, 2]));
          setCurrentStageIndex(0);
          
          // Set continue flag and increment counter to force a fresh fetch
          setContinuePractice(true);
          setPromptsCounter(prev => prev + 1);
          
          // Show toast notification
          toast({
            title: "New Topic",
            description: `Changing to: ${availableTopics[randomIndex].name}`,
            variant: "default"
          });
          
          // Explicitly force a refetch after state updates
          setTimeout(() => {
            refetch();
          }, 100);
          
          console.log(`Random Mode: Automatically switching to new topic ID: ${newRandomTopicId}`);
          return;
        }
      }
      
      // For other modes, show "continue or end" prompt
      setWantNewPrompts(true);
    }
  }, [currentStageIndex, stageSequence, wantNewPrompts, promptsCounter, refetch, isFreeMode, isRandomMode, randomTopicId, allTopics]);

  const handleContinue = () => {
    // In free mode, we just need to generate a new sequence
    if (isFreeMode) {
      setStageSequence(shuffleArray([0, 1, 2]));
      setCurrentStageIndex(0);
      setWantNewPrompts(false);
      console.log("Free Mode: Continuing with new randomized sequence");
      return;
    }
    
    // Increment the counter to force a new fetch for all non-free modes
    const newCounter = promptsCounter + 1;
    setPromptsCounter(newCounter);
    
    // Set continue flag to true to force fresh prompts
    setContinuePractice(true);
    
    // In random mode, switch to a new random topic before continuing
    if (isRandomMode && allTopics.length > 1) {
      // Filter out current topic ID to avoid repeating
      const availableTopics = allTopics.filter(t => t.id.toString() !== randomTopicId);
      
      if (availableTopics.length > 0) {
        // Select a random topic from available ones
        const randomIndex = Math.floor(Math.random() * availableTopics.length);
        const newRandomTopicId = availableTopics[randomIndex].id.toString();
        
        // Update the random topic ID
        setRandomTopicId(newRandomTopicId);
        
        // Show toast notification
        toast({
          title: "Topic Changed",
          description: `New topic: ${availableTopics[randomIndex].name}`,
          variant: "default"
        });
        
        // Reset the stage sequence since we have a new topic
        setStageSequence(shuffleArray([0, 1, 2]));
        setCurrentStageIndex(0);
        
        // Force an immediate refetch with the new topic
        setTimeout(() => {
          refetch();
        }, 100);
        
        console.log(`Random Mode: Switching to new topic ID: ${newRandomTopicId}`);
        
        // No need to wait for the user to continue further, as we're immediately loading new content
        setWantNewPrompts(false);
        return;
      }
    }
    
    // Flag that we want new prompts to update the sequence
    setWantNewPrompts(true);
    
    // Wait a moment for state updates to propagate before refetching
    setTimeout(() => {
      // Explicitly force a refetch
      refetch();
      console.log(`Continuing with new prompts - forcing a refetch with continue=true and counter=${newCounter}`);
    }, 100);
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
  
  const handleSpinTopicWheel = () => {
    // In Random Mode or when changing topics, pick a new topic
    if (allTopics.length > 1) {
      // Filter out current topic ID to avoid repeating
      const activeTopicId = isRandomMode ? randomTopicId : topicId;
      const availableTopics = allTopics.filter(t => t.id.toString() !== activeTopicId);
      
      if (availableTopics.length > 0) {
        // Select a random topic from available ones
        const randomIndex = Math.floor(Math.random() * availableTopics.length);
        const newTopicId = availableTopics[randomIndex].id.toString();
        const newTopicName = availableTopics[randomIndex].name;
        
        // For Random Mode, update the randomTopicId
        if (isRandomMode) {
          setRandomTopicId(newTopicId);
        }
        
        // Reset the stage sequence for the new topic
        setStageSequence(shuffleArray([0, 1, 2]));
        setCurrentStageIndex(0);
        
        // Set continue flag and increment counter to force a fresh fetch
        setContinuePractice(true);
        setPromptsCounter(prev => prev + 1);
        
        // Show success notification with spinning animation in the toast
        toast({
          title: "Topic Wheel Spun!",
          description: (
            <div className="flex items-center">
              <span className="mr-2">New topic:</span>
              <span className="font-semibold">{newTopicName}</span>
            </div>
          ),
          variant: "default",
        });
        
        // Navigate to the new URL with the new topic ID, but retain other parameters
        const newUrl = `/game?level=${level}&topic=${newTopicId}${isFreeMode ? `&customTopic=${encodeURIComponent(customTopic)}&freeMode=true` : ''}${isRandomMode ? '&randomMode=true' : ''}`;
        
        // Use replace instead of navigate to avoid adding to browser history
        navigate(newUrl, { replace: true });
        
        // Force a refetch after state updates
        setTimeout(() => {
          refetch();
        }, 100);
      } else {
        // No other topics available, show a message
        toast({
          title: "No other topics available",
          description: "Try adding more topics to spin the wheel!",
          variant: "destructive",
        });
      }
    } else {
      // Not enough topics to spin, fetch all topics first
      if (!isTopicsLoading) {
        // This will trigger a fetch if we haven't loaded all topics yet
        const fetchTopicsQuery = async () => {
          try {
            const response = await fetch('/api/topics');
            const data = await response.json();
            setAllTopics(data);
            
            if (data.length > 1) {
              // Call this function again now that we have topics
              setTimeout(handleSpinTopicWheel, 100);
            } else {
              toast({
                title: "Not enough topics",
                description: "Need at least 2 topics to spin the wheel.",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Failed to fetch topics:", error);
            toast({
              title: "Error fetching topics",
              description: "Could not get available topics to spin wheel.",
              variant: "destructive",
            });
          }
        };
        
        fetchTopicsQuery();
      } else {
        // Still loading topics
        toast({
          title: "Loading topics...",
          description: "Please wait while we prepare the topic wheel.",
          variant: "default",
        });
      }
    }
  };

  const handleKeywordClick = (word: string) => {
    // Add 1 XP per keyword clicked and store the new value in a variable
    const newXP = groupXP + 1;
    setGroupXP(newXP); 
    console.log(`Keyword clicked: ${word}, +1 XP added. Total: ${newXP}`);
    
    // Add a visual indication for debugging
    toast({
      title: `+1 XP (Total: ${newXP})`,
      description: `Used keyword: "${word}"`,
      variant: "default",
    });
  };
  
  // Generate random keywords for Free Mode
  const generateRandomKeywords = () => {
    const topicWords = [
      "describe", "explain", "discuss", "analyze", "compare", 
      "contrast", "evaluate", "suggest", "consider", "explore",
      "highlight", "focus", "emphasize", "elaborate", "clarify",
      "illustrate", "demonstrate", "reflect", "examine", "investigate"
    ];
    
    // Pick 5 random words
    const randomWords = [];
    const shuffledWords = shuffleArray([...topicWords]);
    for (let i = 0; i < 5; i++) {
      randomWords.push(shuffledWords[i]);
    }
    
    // Set the new keywords in state
    setFreeKeywords(randomWords);
    
    // Show confirmation toast
    toast({
      title: "Keywords Generated",
      description: "New keywords have been generated for your topic",
      variant: "default",
    });
    
    return randomWords;
  };

  const getCurrentPrompt = (): Prompt | undefined => {
    if (!promptsData?.stages || stageSequence.length === 0) return undefined;
    const stageIndex = stageSequence[currentStageIndex];
    return promptsData.stages[stageIndex];
  };

  // Only show loading when we're fetching topic, topics list (for random mode), or (prompts and not in free mode)
  if (isTopicLoading || (isRandomMode && isTopicsLoading) || (!isFreeMode && isPromptsLoading)) {
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
              <button 
                className="text-[#333333] hover:text-[#3498db] transition-colors"
                onClick={() => navigate("/")}
                title="Back to Home"
              >
                <i className="fas fa-home text-xl"></i>
              </button>
              <button 
                className="text-[#333333] hover:text-[#3498db] transition-colors"
                title="Help"
              >
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
    <div className="bg-gradient-to-b from-[#ecf0f1] to-[#e0f2e9] min-h-screen font-['Nunito']">
      <AppHeader onHelpClick={() => setShowHelpModal(true)} />
      
      {/* Group Achievements Panel */}
      <GroupAchievements topicId={topicId} level={level} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!showComplete ? (
            <>
              <GameHeader 
                level={level}
                topic={isFreeMode ? customTopic : (topic?.name || "Topic")}
                currentStage={
                  isFreeMode ? 
                    (stageSequence[currentStageIndex] === 0 ? "Ask" : 
                    stageSequence[currentStageIndex] === 1 ? "Tell" : "Reveal") : 
                    (currentPrompt?.stage || "")
                }
                stageIndex={currentStageIndex}
                totalStages={stageSequence.length}
                groupXP={groupXP}
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
                    
                    {/* Spin Topic Wheel Button */}
                    <div className="mb-4 mt-6 flex justify-center">
                      <Button
                        onClick={handleSpinTopicWheel}
                        className="bg-[#9b59b6] hover:bg-[#9b59b6]/90 text-white font-semibold px-6 py-3 rounded-full"
                      >
                        <motion.span 
                          animate={{ rotate: 360 }}
                          transition={{ 
                            repeat: Infinity,
                            duration: 2,
                            ease: "linear" 
                          }}
                          className="inline-block mr-2"
                        >
                          <i className="fas fa-sync-alt"></i>
                        </motion.span>
                        Spin Topic Wheel
                      </Button>
                    </div>
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
              ) : isFreeMode && stageSequence.length > 0 ? (
                <motion.div
                  key={`free-mode-${currentStageIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`rounded-xl shadow-md p-6 mb-6 border-2 ${
                      stageSequence[currentStageIndex] === 0 
                        ? "bg-blue-50 border-blue-200" 
                        : stageSequence[currentStageIndex] === 1 
                          ? "bg-amber-50 border-amber-200" 
                          : "bg-purple-50 border-purple-200"
                    }`}>
                    <div className="flex items-center justify-center mb-4">
                      <span className="bg-white rounded-full h-10 w-10 flex items-center justify-center shadow-sm mr-3">
                        <i className={`${
                          stageSequence[currentStageIndex] === 0 
                            ? "fas fa-question text-[#3498db]" 
                            : stageSequence[currentStageIndex] === 1 
                              ? "fas fa-comment text-[#f39c12]" 
                              : "fas fa-star text-[#9b59b6]"
                        } text-xl`}></i>
                      </span>
                      <h3 className="font-['Quicksand'] font-bold text-2xl text-center">
                        {stageSequence[currentStageIndex] === 0 ? (
                          <span className="text-[#3498db]">Ask</span>
                        ) : stageSequence[currentStageIndex] === 1 ? (
                          <span className="text-[#f39c12]">Tell</span>
                        ) : (
                          <span className="text-[#9b59b6]">Reveal</span>
                        )}
                      </h3>
                    </div>
                    <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                      <p className="text-lg mb-4">
                        {stageSequence[currentStageIndex] === 0 ? (
                          <>Ask your partner a question about <strong>{customTopic || topic?.name}</strong></>
                        ) : stageSequence[currentStageIndex] === 1 ? (
                          <>Tell your partner something about <strong>{customTopic || topic?.name}</strong></>
                        ) : (
                          <>Reveal something personal related to <strong>{customTopic || topic?.name}</strong></>
                        )}
                      </p>
                      <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                        <i className="fas fa-lightbulb mr-1 text-yellow-500"></i> Free Mode
                      </div>
                    </div>
                  </div>
                
                  {/* Keywords generator button for Free Mode */}
                  <div className="mt-6 mb-6">
                    <Button
                      onClick={generateRandomKeywords}
                      className="bg-[#9b59b6] hover:bg-[#9b59b6]/90 text-white font-semibold px-6 py-2 rounded-full mx-auto flex items-center"
                    >
                      <i className="fas fa-magic mr-2"></i> Generate Keywords
                    </Button>
                  </div>
                  
                  {/* Display keywords if available */}
                  {freeKeywords.length > 0 && (
                    <HintWords 
                      words={freeKeywords}
                      onKeywordClick={handleKeywordClick}
                    />
                  )}
                
                  <div className="flex justify-between items-center mt-6">
                    {/* Spin Topic Wheel Button */}
                    <Button
                      onClick={handleSpinTopicWheel}
                      className="bg-[#9b59b6] hover:bg-[#9b59b6]/90 text-white font-semibold px-6 py-2 rounded-full"
                    >
                      <motion.span 
                        animate={{ rotate: 360 }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 2,
                          ease: "linear" 
                        }}
                        className="inline-block mr-2"
                      >
                        <i className="fas fa-sync-alt"></i>
                      </motion.span>
                      Spin Topic Wheel
                    </Button>
                    
                    {/* Next Button */}
                    <Button
                      onClick={handleNext}
                      className="bg-[#3498db] hover:bg-[#3498db]/90 text-white font-semibold px-6 py-2 rounded-full"
                    >
                      Next <i className="fas fa-arrow-right ml-2"></i>
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
                    onKeywordClick={handleKeywordClick}
                  />
                
                  <div className="flex justify-between items-center mt-6">
                    {/* Spin Topic Wheel Button */}
                    <Button
                      onClick={handleSpinTopicWheel}
                      className="bg-[#9b59b6] hover:bg-[#9b59b6]/90 text-white font-semibold px-6 py-2 rounded-full"
                    >
                      <motion.span 
                        animate={{ rotate: 360 }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 2,
                          ease: "linear" 
                        }}
                        className="inline-block mr-2"
                      >
                        <i className="fas fa-sync-alt"></i>
                      </motion.span>
                      Spin Topic Wheel
                    </Button>
                    
                    {/* Next Button */}
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
