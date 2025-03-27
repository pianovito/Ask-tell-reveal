import { motion } from "framer-motion";

interface HintWordsProps {
  words: string[];
}

const hintColors = [
  { bg: "bg-[#3498db]/10", text: "text-[#3498db]" },
  { bg: "bg-[#f39c12]/10", text: "text-[#f39c12]" },
  { bg: "bg-[#2ecc71]/10", text: "text-[#2ecc71]" },
  { bg: "bg-[#9b59b6]/10", text: "text-[#9b59b6]" }
];

export default function HintWords({ words }: HintWordsProps) {
  // Add console log to debug
  console.log("HintWords component received:", words);
  
  // Check if words is undefined or not an array
  if (!words || !Array.isArray(words) || words.length === 0) {
    console.error("HintWords received invalid data:", words);
    return null;
  }
  
  return (
    <div className="mb-8">
      <div className="flex items-center mb-2">
        <span className="text-sm font-semibold text-gray-600 mr-2">Helpful Words:</span>
        <span className="text-xs text-gray-500">(Use these in your answer)</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {words.map((word, index) => {
          const colorIndex = index % hintColors.length;
          
          return (
            <motion.span
              key={index}
              className={`${hintColors[colorIndex].bg} ${hintColors[colorIndex].text} px-3 py-1 rounded-full text-sm`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              {word}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}
