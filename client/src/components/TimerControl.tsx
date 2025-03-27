import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface TimerControlProps {
  timeRemaining: number;
  timerRunning: boolean;
  onToggleTimer: () => void;
  onNext: () => void;
}

export default function TimerControl({ 
  timeRemaining, 
  timerRunning, 
  onToggleTimer, 
  onNext 
}: TimerControlProps) {
  const circumference = 2 * Math.PI * 40; // 40 is the radius of the circle
  const totalTime = 30; // seconds
  const offset = circumference - (timeRemaining / totalTime) * circumference;

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center">
        <span className="text-sm font-semibold text-gray-600 mr-2">Response Time:</span>
        <div className="relative w-16 h-16">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle 
              className="text-gray-200" 
              strokeWidth="8" 
              stroke="currentColor" 
              fill="transparent" 
              r="40" 
              cx="50" 
              cy="50" 
            />
            <motion.circle 
              className="text-[#3498db] transition-all" 
              strokeWidth="8" 
              stroke="currentColor" 
              fill="transparent" 
              r="40" 
              cx="50" 
              cy="50" 
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={offset}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <span className="font-bold text-lg text-[#3498db]">{timeRemaining}</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button
          onClick={onToggleTimer}
          variant="outline"
          className="bg-white hover:bg-gray-100 text-[#333333] font-semibold py-2 px-4 rounded-lg border border-gray-300 shadow-sm transition-colors flex items-center"
        >
          {timerRunning ? (
            <>
              <i className="fas fa-pause mr-2"></i>
              <span>Pause</span>
            </>
          ) : (
            <>
              <i className="fas fa-play mr-2"></i>
              <span>Resume</span>
            </>
          )}
        </Button>
        
        <Button
          onClick={onNext}
          className="bg-[#3498db] hover:bg-[#3498db]/90 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center"
        >
          <span>Next</span>
          <i className="fas fa-arrow-right ml-2"></i>
        </Button>
      </div>
    </div>
  );
}
