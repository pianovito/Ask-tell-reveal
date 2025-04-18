import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-100 to-green-100 shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex-1">
            <h1 className="font-['Poppins'] font-bold text-3xl sm:text-4xl md:text-5xl text-center text-[#333333]">
              <span className="text-[#3498db]"><i className="fas fa-comments text-3xl mr-2"></i>Ask</span>,
              <span className="text-[#f39c12]">Tell</span>, 
              <span className="text-[#9b59b6]">Reveal</span>
            </h1>
            <p className="text-gray-600 text-sm mt-2 text-center">
              Ask a question, tell something about, reveal a secret
            </p>
          </div>
          <button 
            className="text-[#333333] hover:text-[#3498db] transition-colors"
            onClick={() => setShowHelpModal(true)}
          >
            <i className="fas fa-question-circle text-xl"></i>
          </button>
        </div>
      </header>

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
          <div className={`mt-6 flex items-center justify-center space-x-2 p-4 rounded-lg shadow-sm bg-white transition-colors`}>
            <Switch 
              id="free-mode"
              checked={isFreeMode}
              onCheckedChange={setIsFreeMode}
              className="bg-white data-[state=checked]:bg-[#3498db] border-2 border-gray-200"
            />
            <Label htmlFor="free-mode" className="cursor-pointer">
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
              className="bg-[#3498db] hover:bg-[#3498db]/90 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-play mr-2"></i> Start Practice
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
