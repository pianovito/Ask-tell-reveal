import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Achievement, CEFRLevel, Topic } from "@/lib/types";
import { InsertGameRecord } from "@shared/schema";

interface GameSummaryProps {
  onPlayAgain: () => void;
  onNewTopic: () => void;
  onSaveResults: (data: InsertGameRecord) => Promise<void>;
  score: number;
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
  score,
  level,
  topic,
  topicName,
  achievements,
  keywordsUsed,
  roundsCompleted,
  showTeacherDashboardOptions = false
}: GameSummaryProps) {
  const { toast } = useToast();
  const [studentName, setStudentName] = useState("");
  const [classId, setClassId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Count unlocked achievements
  const unlockedAchievements = achievements.filter(a => a.isUnlocked).length;

  // Calculate performance rating based on score and achievement progress
  const calculateRating = () => {
    const achievementProgress = achievements.reduce((sum, a) => {
      if (a.progress !== undefined && a.maxProgress !== undefined) {
        return sum + (a.progress / a.maxProgress);
      }
      return sum;
    }, 0) / achievements.length;
    
    // Combined rating based on XP and achievements (0-100)
    const combinedScore = Math.min(100, (score / 2) + (achievementProgress * 50));
    
    if (combinedScore >= 90) return { label: "Outstanding!", color: "text-[#27ae60]" };
    if (combinedScore >= 75) return { label: "Excellent!", color: "text-[#2980b9]" };
    if (combinedScore >= 60) return { label: "Great job!", color: "text-[#3498db]" };
    if (combinedScore >= 40) return { label: "Good effort!", color: "text-[#f39c12]" };
    return { label: "Keep practicing!", color: "text-[#95a5a6]" };
  };

  const rating = calculateRating();

  const handleSaveResults = async () => {
    if (!studentName) {
      toast({
        title: "Missing information",
        description: "Please enter your name to save results.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      await onSaveResults({
        studentName,
        classId: classId || undefined,
        level,
        topicId: topic?.id || 0,
        topicName: topic?.name || topicName,
        score,
        achievementsUnlocked: unlockedAchievements,
        keywordsUsed,
        roundsCompleted
      });

      setIsSaved(true);
      toast({
        title: "Results saved!",
        description: "Your results have been saved to the teacher's dashboard.",
        variant: "default"
      });
    } catch (error) {
      console.error("Failed to save results:", error);
      toast({
        title: "Save failed",
        description: "Could not save your results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-[#3498db]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-trophy text-4xl text-[#3498db]"></i>
        </div>
        <h2 className="font-['Quicksand'] font-bold text-3xl mb-2">Practice Complete!</h2>
        <p className="text-gray-600">
          Great job completing your {level} practice session on "{topic?.name || topicName}".
        </p>
      </div>

      {/* Performance Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className={`font-bold text-2xl mb-4 text-center ${rating.color}`}>
          {rating.label}
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Total XP</span>
                <span className="text-sm font-bold text-[#2ecc71]">{score} XP</span>
              </div>
              <Progress 
                value={Math.min(score, 100)} 
                className="h-2 bg-gray-200 [&>div]:bg-gradient-to-r from-[#2ecc71] to-[#1abc9c]" 
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Achievements Unlocked</span>
                <span className="text-sm font-bold text-[#f39c12]">{unlockedAchievements}/{achievements.length}</span>
              </div>
              <Progress 
                value={(unlockedAchievements / achievements.length) * 100} 
                className="h-2 bg-gray-200 [&>div]:bg-gradient-to-r from-[#f39c12] to-[#f1c40f]" 
              />
            </div>
          </div>

          <div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Keywords Used</span>
                <span className="text-sm font-bold text-[#9b59b6]">{keywordsUsed}</span>
              </div>
              <Progress 
                value={Math.min((keywordsUsed / 10) * 100, 100)} 
                className="h-2 bg-gray-200 [&>div]:bg-gradient-to-r from-[#9b59b6] to-[#8e44ad]" 
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Rounds Completed</span>
                <span className="text-sm font-bold text-[#3498db]">{roundsCompleted}</span>
              </div>
              <Progress 
                value={Math.min((roundsCompleted / 3) * 100, 100)} 
                className="h-2 bg-gray-200 [&>div]:bg-gradient-to-r from-[#3498db] to-[#2980b9]" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Dashboard Integration (Optional) */}
      {showTeacherDashboardOptions && (
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="font-['Quicksand'] font-bold text-xl mb-4 flex items-center">
            <i className="fas fa-chalkboard-teacher text-[#3498db] mr-2"></i> 
            Save to Teacher's Dashboard
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                disabled={isSaved}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-1">
                Class ID (Optional)
              </label>
              <input
                type="text"
                id="classId"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                disabled={isSaved}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent"
                placeholder="Enter your class ID (if provided by teacher)"
              />
            </div>
            
            <Button
              onClick={handleSaveResults}
              disabled={isSaving || isSaved || !studentName}
              className={`w-full ${
                isSaved 
                  ? "bg-green-500 hover:bg-green-500" 
                  : "bg-[#3498db] hover:bg-[#3498db]/90"
              } text-white`}
            >
              {isSaving ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Saving...
                </>
              ) : isSaved ? (
                <>
                  <i className="fas fa-check mr-2"></i> Saved to Dashboard
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i> Save Results
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button
          onClick={onPlayAgain}
          className="bg-[#3498db] hover:bg-[#3498db]/90 text-white font-semibold py-2 px-6 rounded-full"
        >
          <i className="fas fa-redo mr-2"></i> Play Again
        </Button>
        
        <Button
          onClick={onNewTopic}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold py-2 px-6 rounded-full"
        >
          <i className="fas fa-exchange-alt mr-2"></i> Try New Topic
        </Button>
      </div>
    </motion.div>
  );
}