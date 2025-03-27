import { motion } from "framer-motion";
import { CEFRLevel } from "@/lib/types";

interface GameHeaderProps {
  level: CEFRLevel;
  topic: string;
  currentStage: string;
  stageIndex: number;
  totalStages: number;
}

export default function GameHeader({ level, topic, currentStage, stageIndex, totalStages }: GameHeaderProps) {
  // Display the stage name at the top
  return (
    <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
      <div className="mb-4 md:mb-0">
        <div className="text-sm text-gray-500 mb-1">Speaking Practice:</div>
        <div className="flex items-center">
          <span className="bg-[#3498db]/10 text-[#3498db] font-semibold py-1 px-3 rounded-full text-sm mr-2">
            {level}
          </span>
          <h2 className="font-['Quicksand'] font-bold text-xl">{topic}</h2>
        </div>
      </div>
      
      {/* Current Stage Indicator */}
      <div className="flex flex-col items-center">
        <div className="text-center mb-1">
          <span className="font-semibold text-lg text-[#3498db]">{currentStage}</span>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalStages }).map((_, index) => (
            <motion.div 
              key={index}
              className={`h-3 w-3 rounded-full ${
                index === stageIndex 
                  ? "bg-[#3498db]" 
                  : index < stageIndex 
                    ? "bg-[#2ecc71]" 
                    : "bg-gray-200"
              }`}
              animate={index === stageIndex ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
