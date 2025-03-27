import { motion } from "framer-motion";
import { CEFRLevel } from "@/lib/types";

interface GameHeaderProps {
  level: CEFRLevel;
  topic: string;
  currentStage: number;
}

export default function GameHeader({ level, topic, currentStage }: GameHeaderProps) {
  const stages = ["Ask", "Tell", "Reveal"];

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
      
      {/* Progress Indicator */}
      <div className="flex items-center space-x-2">
        {stages.map((stage, index) => (
          <div key={stage} className="flex items-center">
            {index > 0 && <div className="w-6 h-0.5 bg-gray-300"></div>}
            <div className="flex items-center space-x-1">
              <motion.div 
                className={`h-4 w-4 rounded-full ${
                  index === currentStage 
                    ? "bg-[#3498db]" 
                    : index < currentStage 
                      ? "bg-[#2ecc71]" 
                      : "bg-gray-200"
                }`}
                animate={index === currentStage ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span 
                className={`text-xs font-semibold ${
                  index === currentStage 
                    ? "text-[#3498db]" 
                    : index < currentStage
                      ? "text-[#2ecc71]"
                      : "text-gray-400"
                }`}
              >
                {stage}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
