import { motion } from "framer-motion";
import { Prompt } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface PromptCardProps {
  prompt: Prompt;
  isLoading: boolean;
}

const stageColors = {
  "Ask": "text-[#3498db]",
  "Tell": "text-[#f39c12]",
  "Reveal": "text-[#9b59b6]"
};

export default function PromptCard({ prompt, isLoading }: PromptCardProps) {
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
      className="bg-white rounded-2xl shadow-md p-6 mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-2">
        <span className={`font-['Comfortaa'] text-lg font-bold ${stageColors[prompt.stage]}`}>
          {prompt.stage}
        </span>
      </div>
      
      <h3 className="font-['Quicksand'] text-xl md:text-2xl font-bold mb-2 text-[#333333]">
        {prompt.question}
      </h3>
      
      <p className="text-gray-600 italic">
        {prompt.context}
      </p>
    </motion.div>
  );
}
