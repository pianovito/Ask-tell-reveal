import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Achievement, GameStats, defaultAchievements } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

interface GroupAchievementsProps {
  topicId: string | number;
  level: string;
}

export default function GroupAchievements({ topicId, level }: GroupAchievementsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    groupXP: 0,
    roundsCompleted: 0,
    achievements: [...defaultAchievements]
  });

  // Setup local storage for persistent progress
  useEffect(() => {
    // Try to load saved game stats from localStorage
    const savedStats = localStorage.getItem('groupAchievements');
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        setGameStats(parsed);
      } catch (e) {
        console.error("Error loading saved achievements:", e);
      }
    }
  }, []);
  
  // We'll store a map of previously seen topics to track Topic Explorer achievement
  const [visitedTopics, setVisitedTopics] = useState<Set<string>>(new Set());
  
  // Update visited topics when topicId changes and update localStorage
  useEffect(() => {
    if (topicId) {
      // Convert to array, update, then back to set to avoid iteration issues
      const currentTopics = Array.from(visitedTopics);
      if (!currentTopics.includes(topicId.toString())) {
        currentTopics.push(topicId.toString());
        setVisitedTopics(new Set(currentTopics));
      }
      
      // Update Topic Explorer achievement
      setGameStats(prev => {
        const updatedAchievements = [...prev.achievements];
        const topicExplorerIndex = updatedAchievements.findIndex(a => a.id === "topic_explorer");
        
        if (topicExplorerIndex >= 0 && updatedAchievements[topicExplorerIndex].progress !== undefined) {
          // Get the count of unique topics
          const uniqueTopicsCount = new Set([...currentTopics, topicId.toString()]).size;
          
          // Update progress to match the number of unique topics visited
          const newProgress = Math.min(uniqueTopicsCount, updatedAchievements[topicExplorerIndex].maxProgress!);
          updatedAchievements[topicExplorerIndex].progress = newProgress;
          
          // Check if completed
          if (newProgress >= updatedAchievements[topicExplorerIndex].maxProgress!) {
            updatedAchievements[topicExplorerIndex].isUnlocked = true;
          }
        }
        
        const newStats = {
          ...prev,
          achievements: updatedAchievements
        };
        
        // Save to localStorage
        localStorage.setItem('groupAchievements', JSON.stringify(newStats));
        
        return newStats;
      });
    }
  }, [topicId, visitedTopics]);
  
  // Listen for two types of events: Next button clicks and keyword clicks
  useEffect(() => {
    // Handle Next button clicks for Vocabulary Master achievement
    const handleNextButtonEvent = (e: CustomEvent) => {
      // Update Vocabulary Master progress
      setGameStats(prev => {
        const updatedAchievements = [...prev.achievements];
        const vocabMasterIndex = updatedAchievements.findIndex(a => a.id === "vocabulary_master");
        
        if (vocabMasterIndex >= 0 && updatedAchievements[vocabMasterIndex].progress !== undefined) {
          // Only update if not already completed
          if (updatedAchievements[vocabMasterIndex].progress! < updatedAchievements[vocabMasterIndex].maxProgress!) {
            updatedAchievements[vocabMasterIndex].progress! += 1;
            
            // Check if completed
            if (updatedAchievements[vocabMasterIndex].progress! >= updatedAchievements[vocabMasterIndex].maxProgress!) {
              updatedAchievements[vocabMasterIndex].isUnlocked = true;
            }
          }
        }
        
        const newStats = {
          ...prev,
          achievements: updatedAchievements,
          groupXP: e.detail?.xp || prev.groupXP // Update XP if provided in the event
        };
        
        // Save to localStorage
        localStorage.setItem('groupAchievements', JSON.stringify(newStats));
        
        return newStats;
      });
    };
    
    // Handle XP updates from keyword clicks
    const handleXpUpdateEvent = (e: CustomEvent) => {
      setGameStats(prev => {
        const newStats = {
          ...prev,
          groupXP: e.detail?.xp || prev.groupXP
        };
        
        // Save to localStorage
        localStorage.setItem('groupAchievements', JSON.stringify(newStats));
        
        return newStats;
      });
    };
    
    // Listen for both events
    window.addEventListener('nextButtonClicked' as any, handleNextButtonEvent);
    window.addEventListener('xpUpdated' as any, handleXpUpdateEvent);
    
    return () => {
      window.removeEventListener('nextButtonClicked' as any, handleNextButtonEvent);
      window.removeEventListener('xpUpdated' as any, handleXpUpdateEvent);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="bg-[#3498db] hover:bg-[#3498db]/90 text-white rounded-full h-12 w-12 shadow-lg flex items-center justify-center"
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-trophy'} text-xl`}></i>
      </button>
      
      {/* Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 bg-white rounded-xl shadow-xl p-4 w-80"
          >
            <h3 className="font-['Quicksand'] font-bold text-lg mb-4 text-[#34495e] flex items-center">
              <i className="fas fa-users text-[#3498db] mr-2"></i> Group Progress
            </h3>
            
            {/* XP Display */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-gray-600">Group XP</span>
                <span className="text-sm font-bold text-[#2ecc71]">{gameStats.groupXP} XP</span>
              </div>
              <div className="bg-gray-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#2ecc71] to-[#1abc9c] h-full rounded-full"
                  style={{ width: `${Math.min(gameStats.groupXP / 2, 100)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Achievements */}
            <h4 className="font-medium text-sm text-gray-600 mb-2">
              Achievements
            </h4>
            
            <div className="space-y-3">
              {gameStats.achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-3 rounded-lg border ${
                    achievement.isUnlocked 
                      ? 'bg-[#f39c12]/10 border-[#f39c12]/20' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`text-xl mr-3 ${
                      achievement.isUnlocked ? 'text-[#f39c12]' : 'text-gray-400'
                    }`}>
                      <i className={`fas ${achievement.icon}`}></i>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold">
                        {achievement.name}
                      </h5>
                      <p className="text-xs text-gray-500">
                        {achievement.description}
                      </p>
                      
                      {/* Progress bar for achievements with progress */}
                      {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">
                              Progress: {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-1 w-full" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}