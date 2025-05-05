import { motion } from "framer-motion";
import { useState } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface HintWordsProps {
  words: string[];
  onKeywordClick?: (word: string) => void;
}

const hintColors = [
  { bg: "bg-[#3498db]/10", text: "text-[#3498db]", hoverBg: "hover:bg-[#3498db]/20", border: "border-[#3498db]" },
  { bg: "bg-[#f39c12]/10", text: "text-[#f39c12]", hoverBg: "hover:bg-[#f39c12]/20", border: "border-[#f39c12]" },
  { bg: "bg-[#2ecc71]/10", text: "text-[#2ecc71]", hoverBg: "hover:bg-[#2ecc71]/20", border: "border-[#2ecc71]" },
  { bg: "bg-[#9b59b6]/10", text: "text-[#9b59b6]", hoverBg: "hover:bg-[#9b59b6]/20", border: "border-[#9b59b6]" }
];

export default function HintWords({ words, onKeywordClick }: HintWordsProps) {
  const [clickedWords, setClickedWords] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  // Add console log to debug
  console.log("HintWords component received:", words);
  
  // Check if words is undefined or not an array
  if (!words || !Array.isArray(words) || words.length === 0) {
    console.error("HintWords received invalid data:", words);
    return null;
  }
  
  const handleWordClick = (word: string) => {
    // If already clicked, do nothing
    if (clickedWords[word]) return;
    
    // Mark as clicked
    setClickedWords(prev => ({ ...prev, [word]: true }));
    
    // Call the callback if provided
    if (onKeywordClick) {
      onKeywordClick(word);
      
      // Show word used notification without XP references
      toast({
        title: "Word Used",
        description: `You used the keyword: "${word}"`,
        variant: "default",
      });
    }
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center mb-2">
        <span className="text-sm font-semibold text-gray-600 mr-2">Helpful Words:</span>
        <span className="text-xs text-gray-500">(Click to mark words you've used in your answer)</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {words.map((word, index) => {
          const colorIndex = index % hintColors.length;
          const isClicked = clickedWords[word];
          
          return (
            <motion.button
              key={index}
              onClick={() => handleWordClick(word)}
              className={`
                px-4 py-3 rounded-xl text-center text-base font-medium w-full
                transition-all duration-200 cursor-pointer
                ${isClicked ? 'border' : 'border border-transparent'}
                ${isClicked 
                  ? `${hintColors[colorIndex].bg} ${hintColors[colorIndex].text} ${hintColors[colorIndex].border}`
                  : `${hintColors[colorIndex].bg} ${hintColors[colorIndex].text} ${hintColors[colorIndex].hoverBg}`
                }
                ${isClicked ? 'scale-95' : 'hover:scale-105'}
              `}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              disabled={isClicked}
            >
              {isClicked ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-check mr-1 text-xs"></i>
                  {word}
                </span>
              ) : word}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
