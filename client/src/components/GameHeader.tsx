import { motion } from "framer-motion";
import { CEFRLevel } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

interface GameHeaderProps {
  level: CEFRLevel;
  topic: string;
  currentStage: string;
  stageIndex: number;
  totalStages: number;
}

// Define stage color mapping
const stageColors = {
  "Ask": { bg: "bg-[#3498db]/10", text: "text-[#3498db]", border: "border-[#3498db]", progress: "from-[#3498db]/50 to-[#3498db]" },
  "Tell": { bg: "bg-[#f39c12]/10", text: "text-[#f39c12]", border: "border-[#f39c12]", progress: "from-[#f39c12]/50 to-[#f39c12]" },
  "Reveal": { bg: "bg-[#9b59b6]/10", text: "text-[#9b59b6]", border: "border-[#9b59b6]", progress: "from-[#9b59b6]/50 to-[#9b59b6]" }
};

export default function GameHeader({ level, topic, currentStage, stageIndex, totalStages }: GameHeaderProps) {
  // Get the color scheme for the current stage
  const colorScheme = stageColors[currentStage as keyof typeof stageColors] || stageColors["Ask"];
  
  // Calculate progress percentage
  const progressPercent = ((stageIndex + 1) / totalStages) * 100;
  
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-xl shadow-md p-5 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center">
            {/* Topic icon and name */}
            <div className="mr-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorScheme.bg} ${colorScheme.border} border`}>
                <i className="fas fa-comment-dots text-lg"></i>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 mb-1 flex items-center">
                <i className="fas fa-graduation-cap mr-1 text-[#34495e]"></i>
                <span>CEFR Level:</span>
              </div>
              <div className="flex items-center">
                <span className={`${colorScheme.bg} ${colorScheme.text} font-semibold py-1 px-3 rounded-full text-sm mr-2`}>
                  {level}
                </span>
                <h2 className="font-semibold text-xl text-center">{topic}</h2>
              </div>
            </div>
          </div>
          
          {/* Current Stage Indicator */}
          <div className="flex flex-col items-center">
            <div className="text-center mb-2">
              <span className={`font-bold text-lg ${colorScheme.text}`}>{currentStage}</span>
              <span className="text-sm text-gray-500 ml-2">({stageIndex + 1}/{totalStages})</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-32">
              <Progress 
                value={progressPercent} 
                className="h-2 bg-gray-100"
                indicatorClassName={`bg-gradient-to-r ${colorScheme.progress}`}
              />
            </div>
          </div>
        </div>
        
        {/* Stage Icons */}
        <div className="flex justify-center mt-4 pt-4 border-t border-gray-100">
          {Object.keys(stageColors).map((stage, index) => {
            const isActive = currentStage === stage;
            const isPast = 
              (currentStage === "Tell" && stage === "Ask") || 
              (currentStage === "Reveal" && (stage === "Ask" || stage === "Tell"));
            
            return (
              <motion.div
                key={stage}
                className={`flex flex-col items-center mx-3 ${isActive ? "" : "opacity-60"}`}
                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 
                  ${isActive 
                    ? `${stageColors[stage as keyof typeof stageColors].bg} ${stageColors[stage as keyof typeof stageColors].border} border` 
                    : "bg-gray-100"}`
                }>
                  <i className={`fas ${
                    stage === "Ask" ? "fa-question" : 
                    stage === "Tell" ? "fa-comment" : "fa-star"
                  } text-sm ${isActive ? stageColors[stage as keyof typeof stageColors].text : "text-gray-400"}`}></i>
                </div>
                <span className={`text-xs font-medium ${
                  isActive 
                    ? stageColors[stage as keyof typeof stageColors].text
                    : "text-gray-400"
                }`}>{stage}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
