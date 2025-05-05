import { motion } from "framer-motion";
import { Prompt } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface PromptCardProps {
  prompt: Prompt;
  isLoading: boolean;
  score?: number; // Add score prop
}

const stageColors = {
  "Ask": "text-[#3498db]",
  "Tell": "text-[#f39c12]",
  "Reveal": "text-[#9b59b6]"
};

const stageBgColors = {
  "Ask": "bg-[#3498db]/10",
  "Tell": "bg-[#f39c12]/10",
  "Reveal": "bg-[#9b59b6]/10"
};

export default function PromptCard({ prompt, isLoading, score = 5 }: PromptCardProps) {
  // Random vocabulary challenge with 50% chance if not already set
  const [vocabularyChallenge, setVocabularyChallenge] = useState<string | undefined>(prompt.vocabularyChallenge);
  
  useEffect(() => {
    // If prompt already has a vocabulary challenge, use it
    if (prompt.vocabularyChallenge) {
      setVocabularyChallenge(prompt.vocabularyChallenge);
      return;
    }
    
    // 50% chance to add a vocabulary challenge
    if (Math.random() > 0.5) {
      // Select a random advanced word based on the current prompt
      const advancedWords = [
        "eloquent", "profound", "intricate", "meticulous", 
        "jubilant", "nostalgic", "serene", "ambivalent",
        "perplexing", "enigmatic", "spontaneous", "arduous"
      ];
      
      const randomWord = advancedWords[Math.floor(Math.random() * advancedWords.length)];
      setVocabularyChallenge(randomWord);
    } else {
      setVocabularyChallenge(undefined);
    }
  }, [prompt]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="mb-2">
          <Skeleton className="h-7 w-16" />
        </div>
        <Skeleton className="h-7 w-3/4 mb-2" />
        <Skeleton className="h-7 w-1/2 mb-2" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    );
  }

  return (
    <motion.div 
      className={`${stageBgColors[prompt.stage]} rounded-2xl shadow-md p-6 mb-6 border border-${stageColors[prompt.stage].replace('text-', '')}/20`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className={`font-['Quicksand'] text-lg font-bold ${stageColors[prompt.stage]}`}>
          {prompt.stage}
        </span>
        
        {/* Group XP Indicator */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2ecc71] text-white font-bold shadow-md">
            +{score}
          </div>
        </motion.div>
      </div>
      
      <h3 className="font-['Quicksand'] text-xl md:text-2xl font-bold mb-3 text-[#34495e]">
        {prompt.question}
      </h3>
      
      <p className="text-gray-600 italic mb-4">
        {prompt.context}
      </p>
      
      {/* Vocabulary Challenge */}
      {vocabularyChallenge && (
        <motion.div 
          className="mt-4 p-3 bg-[#9b59b6]/10 border border-[#9b59b6]/20 rounded-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="flex items-center text-sm font-semibold text-[#9b59b6] mb-1">
            <i className="fas fa-book mr-2"></i> Vocabulary Challenge
          </h4>
          <p className="text-sm text-gray-700">
            Include the word <span className="font-bold">{vocabularyChallenge}</span> in your response for bonus XP!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
