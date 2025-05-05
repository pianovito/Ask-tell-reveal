import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InsertGameRecord } from "@shared/schema";
import { Topic, Achievement, CEFRLevel } from "@/lib/types";

interface GameSummaryProps {
  onPlayAgain: () => void;
  onNewTopic: () => void;
  onSaveResults: (data: InsertGameRecord) => Promise<void>;
  level: CEFRLevel;
  topic: Topic | null;
  topicName: string;
  achievements: Achievement[];
  keywordsUsed: number;
  roundsCompleted: number;
  showTeacherDashboardOptions: boolean;
}

export default function GameSummary({
  onPlayAgain,
  onNewTopic,
  onSaveResults,
  level,
  topic,
  topicName,
  achievements,
  keywordsUsed,
  roundsCompleted,
  showTeacherDashboardOptions
}: GameSummaryProps) {
  const [studentName, setStudentName] = useState("");
  const [classId, setClassId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  
  // Count unlocked achievements
  const unlockedAchievements = achievements.filter(a => a.isUnlocked).length;
  
  // Grade calculation removed with XP system
  
  const handleSaveResults = async () => {
    if (!studentName) return;
    
    setIsSaving(true);
    
    try {
      const gameRecord: InsertGameRecord = {
        studentName,
        classId: classId || undefined,
        topicId: topic?.id || 0,
        topicName,
        level,
        score: 0, // Score set to 0 as XP system is removed
        keywordsUsed,
        roundsCompleted,
        achievementsUnlocked: unlockedAchievements,
        completedAt: new Date()
      };
      
      await onSaveResults(gameRecord);
      setShowSaveForm(false);
    } catch (error) {
      console.error("Error saving results:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md p-8 text-center"
    >
      <div className="mb-6">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-50 rounded-full h-20 w-20 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
              className="text-3xl text-blue-600"
            >
              <i className="fas fa-trophy"></i>
            </motion.div>
          </div>
        </div>
        
        <h2 className="font-['Quicksand'] font-bold text-2xl mb-1">
          Practice Complete!
        </h2>
        
        <div className="text-gray-600 mb-4">
          Great job completing your speaking practice.
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-amber-600 mb-1">{keywordsUsed}</div>
            <div className="text-sm text-gray-600">Keywords Used</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">{roundsCompleted}</div>
            <div className="text-sm text-gray-600">Rounds Completed</div>
          </div>
        </div>
        
        {/* Achievements section */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Achievements Unlocked ({unlockedAchievements}/{achievements.length})</h3>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-2 rounded-lg flex flex-col items-center ${
                  achievement.isUnlocked ? "bg-gradient-to-b from-amber-50 to-amber-100" : "bg-gray-100"
                }`}
              >
                <div className={`text-2xl mb-1 ${achievement.isUnlocked ? "text-amber-500" : "text-gray-400"}`}>
                  <i className={`fas ${achievement.icon}`}></i>
                </div>
                <div className={`text-xs font-medium ${achievement.isUnlocked ? "text-amber-800" : "text-gray-500"}`}>
                  {achievement.name}
                </div>
                {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, (achievement.progress / achievement.maxProgress) * 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Teacher dashboard options */}
        {showTeacherDashboardOptions && (
          <div className="mb-6">
            {!showSaveForm ? (
              <Button 
                onClick={() => setShowSaveForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
              >
                <i className="fas fa-save mr-2"></i> Save Results
              </Button>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">Save Your Results</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="studentName">Your Name</Label>
                    <Input
                      id="studentName"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="classId">Class ID (Optional)</Label>
                    <Input
                      id="classId"
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      placeholder="Enter your class ID"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      onClick={handleSaveResults}
                      disabled={!studentName || isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full flex-1"
                    >
                      {isSaving ? (
                        <>
                          <i className="fas fa-circle-notch fa-spin mr-2"></i> Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-2"></i> Save
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => setShowSaveForm(false)}
                      variant="outline"
                      className="rounded-full flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
          <Button
            onClick={onPlayAgain}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
          >
            <i className="fas fa-redo mr-2"></i> Play Again
          </Button>
          
          <Button
            onClick={onNewTopic}
            variant="outline"
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
          >
            <i className="fas fa-book mr-2"></i> New Topic
          </Button>
        </div>
      </div>
    </motion.div>
  );
}