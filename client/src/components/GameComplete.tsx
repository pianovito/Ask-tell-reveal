import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface GameCompleteProps {
  onRestart: () => void;
  onNewTopic: () => void;
}

export default function GameComplete({ onRestart, onNewTopic }: GameCompleteProps) {
  return (
    <motion.div 
      className="max-w-4xl mx-auto text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 15 }}
    >
      <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
        <motion.div 
          className="text-[#2ecc71] text-5xl mb-4"
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", damping: 10, delay: 0.2 }}
        >
          <i className="fas fa-check-circle"></i>
        </motion.div>
        
        <h2 className="font-['Quicksand'] font-bold text-2xl md:text-3xl text-[#333333] mb-3">
          Practice Complete!
        </h2>
        <p className="text-gray-600 mb-6">
          Great job working through all three speaking prompts!
        </p>
        
        <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
          <Button
            onClick={onNewTopic}
            variant="outline"
            className="bg-white hover:bg-gray-100 text-[#333333] font-semibold py-3 px-6 rounded-full border border-gray-300 shadow-sm transition-colors"
          >
            <i className="fas fa-sync-alt mr-2"></i> Try New Topic
          </Button>
          
          <Button
            onClick={onRestart}
            className="bg-[#3498db] hover:bg-[#3498db]/90 text-white font-semibold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-colors"
          >
            <i className="fas fa-redo mr-2"></i> Restart Practice
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
