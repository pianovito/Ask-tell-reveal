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

  // Simulated XP gain - would be connected to actual gameplay
  useEffect(() => {
    const interval = setInterval(() => {
      setGameStats(prev => ({
        ...prev,
        groupXP: prev.groupXP + Math.floor(Math.random() * 5) + 1
      }));
    }, 30000); // Add XP every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Simulate achievement progress
  useEffect(() => {
    if (gameStats.groupXP > 50) {
      // Update the "Vocabulary Master" achievement progress
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
        
        return {
          ...prev,
          achievements: updatedAchievements
        };
      });
    }
  }, [gameStats.groupXP]);

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
            
            {/* Topic Wheel Button */}
            <div className="mt-4 flex justify-center">
              <button
                className="bg-[#9b59b6] hover:bg-[#9b59b6]/90 text-white px-4 py-2 rounded-full text-sm flex items-center shadow-md transition-colors"
              >
                <i className="fas fa-dharmachakra animate-spin-slow mr-2"></i> Spin Topic Wheel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}