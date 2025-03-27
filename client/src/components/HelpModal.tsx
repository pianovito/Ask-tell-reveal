import { motion, AnimatePresence } from "framer-motion";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-lg max-w-lg w-full mx-4 p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-['Quicksand'] font-bold text-xl text-[#333333]">How to Use This App</h3>
              <button className="text-gray-500 hover:text-[#333333]" onClick={onClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-['Quicksand'] font-semibold text-[#3498db] mb-1">1. Choose Your Level</h4>
                <p className="text-gray-600 text-sm">Select your English proficiency level (B1, B2, or C1) to get appropriate questions.</p>
              </div>
              
              <div>
                <h4 className="font-['Quicksand'] font-semibold text-[#f39c12] mb-1">2. Pick a Topic</h4>
                <p className="text-gray-600 text-sm">Select a conversation topic that interests you from the available options.</p>
              </div>
              
              <div>
                <h4 className="font-['Quicksand'] font-semibold text-[#2ecc71] mb-1">3. Practice Speaking</h4>
                <p className="text-gray-600 text-sm">Follow the three-step process:</p>
                <ul className="text-gray-600 text-sm list-disc pl-5 space-y-1 mt-1">
                  <li><span className="font-semibold">Ask:</span> Answer a general question about the topic</li>
                  <li><span className="font-semibold">Tell:</span> Answer a deeper follow-up question</li>
                  <li><span className="font-semibold">Reveal:</span> Share something you've never told others before</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-['Quicksand'] font-semibold text-[#9b59b6] mb-1">4. Use Hint Words</h4>
                <p className="text-gray-600 text-sm">Incorporate the suggested vocabulary in your responses to expand your language use.</p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button 
                onClick={onClose}
                className="bg-[#3498db] hover:bg-[#3498db]/90 text-white font-semibold py-2 px-6 rounded-full transition-colors"
              >
                Got It!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
