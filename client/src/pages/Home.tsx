import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AppHeader from "@/components/AppHeader";
import LevelSelector from "@/components/LevelSelector";
import TopicSelector from "@/components/TopicSelector";
import HelpModal from "@/components/HelpModal";
import { CEFRLevel, Topic } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>("B1");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [isFreeMode, setIsFreeMode] = useState(false);
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // List of random topics for the random button
  const randomTopics = [
    "Climate Change", "Social Media", "Future of Work", 
    "Cultural Traditions", "Artificial Intelligence", "Sports and Fitness",
    "Travel Adventures", "Health and Wellness", "Personal Growth",
    "Favorite Books", "Dream Vacations", "Learning Languages",
    "Music Preferences", "Environmental Issues", "Technology Trends"
  ];

  // Generate a random topic
  const generateRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * randomTopics.length);
    setCustomTopic(randomTopics[randomIndex]);
  };

  // Log state changes for debugging
  useEffect(() => {
    console.log("Home state:", { selectedLevel, selectedTopic, isFreeMode, isRandomMode, customTopic });
  }, [selectedLevel, selectedTopic, isFreeMode, isRandomMode, customTopic]);
  
  // Toggle handlers
  const toggleFreeMode = () => {
    if (isRandomMode) {
      setIsRandomMode(false);
    }
    setIsFreeMode(!isFreeMode);
  };
  
  const toggleRandomMode = () => {
    if (isFreeMode) {
      setIsFreeMode(false);
    }
    setIsRandomMode(!isRandomMode);
  };

  const handleStartGame = () => {
    if (isRandomMode) {
      // Random mode: uses all topics in a random order
      // We'll still need a default topicId, but the game will pick a random one
      const url = `/game?level=${selectedLevel}&randomMode=true&topic=1`;
      console.log("Navigating to random mode:", url);
      navigate(url);
    } else if (isFreeMode && customTopic) {
      // Free Mode with custom topic - generate prompts based on the custom topic
      // We still need a topicId parameter (required by API), but it's mostly ignored in Free Mode
      const url = `/game?level=${selectedLevel}&customTopic=${encodeURIComponent(customTopic)}&freeMode=true&topic=1`;
      console.log("Navigating to free mode with custom topic:", url);
      navigate(url);
    } else if (selectedTopic) {
      // Regular mode with selected topic card
      const url = `/game?level=${selectedLevel}&topic=${selectedTopic.id}`;
      console.log("Navigating to game with topic:", url);
      navigate(url);
    } else {
      // Show appropriate error message based on mode
      toast({
        title: "Select a topic",
        description: isFreeMode 
          ? "Please enter a custom topic in the text box." 
          : isRandomMode 
            ? "Random Mode is selected but couldn't initialize. Please try again." 
            : "Please select a topic before starting.",
        variant: "default",
      });
    }
  };

  return (
    <div className="bg-[#f5f7fa] min-h-screen font-['Nunito']">
      <AppHeader onHelpClick={() => setShowHelpModal(true)} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">


          {/* Level Selector */}
          <LevelSelector 
            selectedLevel={selectedLevel} 
            onLevelChange={setSelectedLevel} 
          />

          {/* Topic Selector */}
          <TopicSelector 
            selectedTopic={selectedTopic} 
            onTopicSelect={setSelectedTopic} 
          />

          {/* Free Mode Toggle */}
          <div className={`mt-6 p-4 rounded-lg shadow-sm bg-white ${isFreeMode ? 'bg-blue-50 border border-blue-200' : ''} transition-colors`}>
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Button
                onClick={toggleFreeMode}
                className={`min-w-[70px] ${isFreeMode ? 'bg-[#3498db] hover:bg-[#3498db]/90' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {isFreeMode ? 'ON' : 'OFF'}
              </Button>
              <Label className="cursor-pointer">
                <span className={`font-medium ${isFreeMode ? 'text-[#3498db]' : ''}`}>Free Mode</span>
                <p className="text-sm text-gray-500 mt-1">
                  Practice with only the topic and randomized activity types (without specific prompts)
                </p>
              </Label>
            </div>
            
            {isFreeMode && (
              <div className="mt-3 border-t border-blue-100 pt-3">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <p className="text-sm text-[#3498db] font-medium">
                    <i className="fas fa-lightbulb mr-1"></i> 
                    You can use a custom topic in Free Mode:
                  </p>
                  <div className="flex w-full max-w-md gap-2">
                    <input
                      type="text"
                      placeholder="Enter your own topic..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db]"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                    />
                    <Button
                      onClick={generateRandomTopic}
                      className="bg-[#9b59b6] hover:bg-[#9b59b6]/90 text-white"
                    >
                      <i className="fas fa-random mr-1"></i> Random
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    Custom topics will override your topic selection when Free Mode is ON
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Random Mode Toggle */}
          <div className={`mt-6 p-4 rounded-lg shadow-sm bg-white ${isRandomMode ? 'bg-purple-50 border border-purple-200' : ''} transition-colors`}>
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Button
                onClick={toggleRandomMode}
                className={`min-w-[70px] ${isRandomMode ? 'bg-[#9b59b6] hover:bg-[#9b59b6]/90' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {isRandomMode ? 'ON' : 'OFF'}
              </Button>
              <Label className="cursor-pointer">
                <span className={`font-medium ${isRandomMode ? 'text-[#9b59b6]' : ''}`}>Random Mode</span>
                <p className="text-sm text-gray-500 mt-1">
                  Practice with random topics selected for you (cycles through all conversation topics)
                </p>
              </Label>
            </div>
            
            {isRandomMode && (
              <div className="mt-3 border-t border-purple-100 pt-3">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <p className="text-sm text-[#9b59b6] font-medium flex items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 3,
                        ease: "linear" 
                      }}
                      className="inline-block mr-2"
                    >
                      <i className="fas fa-sync-alt"></i>
                    </motion.div> 
                    Spin Topic Wheel - Topic will change automatically after each round
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Start Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={handleStartGame}
              disabled={(!isRandomMode && !selectedTopic && !(isFreeMode && customTopic))}
              className="bg-[#3498db] hover:bg-[#3498db]/90 text-white font-bold text-lg py-4 px-10 rounded-full transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-play mr-2"></i> Start Game
            </Button>
          </div>
        </div>
      </main>

      {/* Help Modal */}
      <HelpModal 
        isOpen={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
      />
    </div>
  );
}