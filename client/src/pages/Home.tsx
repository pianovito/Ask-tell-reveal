import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import LevelSelector from "@/components/LevelSelector";
import TopicSelector from "@/components/TopicSelector";
import HelpModal from "@/components/HelpModal";
import { CEFRLevel, Topic } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>("B1");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isFreeMode, setIsFreeMode] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Log state changes for debugging
  useEffect(() => {
    console.log("Home state:", { selectedLevel, selectedTopic, isFreeMode });
  }, [selectedLevel, selectedTopic, isFreeMode]);

  const handleStartGame = () => {
    if (selectedTopic) {
      const url = `/game?level=${selectedLevel}&topic=${selectedTopic.id}&freeMode=${isFreeMode}`;
      console.log("Navigating to:", url);
      navigate(url);
    } else {
      toast({
        title: "Select a topic",
        description: "Please select a topic before starting.",
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
          <div className={`mt-6 flex items-center justify-center space-x-2 p-4 rounded-lg shadow-sm bg-white ${isFreeMode ? 'bg-blue-50 border border-blue-200' : ''} transition-colors`}>
            <Button
              onClick={() => setIsFreeMode(!isFreeMode)}
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

          {/* Start Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={handleStartGame}
              disabled={!selectedTopic}
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