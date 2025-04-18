import { CEFRLevel } from "@/lib/types";
import { GraduationCap } from "lucide-react";

interface LevelSelectorProps {
  selectedLevel: CEFRLevel;
  onLevelChange: (level: CEFRLevel) => void;
}

export default function LevelSelector({ selectedLevel, onLevelChange }: LevelSelectorProps) {
  return (
    <div className="mb-8">
      <h3 className="font-['Quicksand'] font-semibold text-xl text-[#333333] mb-4 flex items-center gap-2">
        <GraduationCap className="w-5 h-5" />
        CEFR level
      </h3>
      <div className="level-selector flex flex-wrap justify-center gap-4">
        <div className="relative">
          <input 
            type="radio" 
            id="level-b1" 
            name="level" 
            value="B1" 
            className="sr-only" 
            checked={selectedLevel === "B1"}
            onChange={() => onLevelChange("B1")}
          />
          <label 
            htmlFor="level-b1" 
            className={`flex flex-col items-center px-6 py-4 border-2 rounded-xl cursor-pointer transition-colors ${
              selectedLevel === "B1" 
                ? "border-[#3498db] bg-[#3498db] text-white" 
                : "border-gray-300 hover:border-[#3498db]"
            }`}
          >
            <span className="text-2xl font-bold">B1</span>
            <span className={`text-sm ${selectedLevel === "B1" ? "text-white" : "text-gray-600"}`}>
              Intermediate
            </span>
          </label>
        </div>
        
        <div className="relative">
          <input 
            type="radio" 
            id="level-b2" 
            name="level" 
            value="B2" 
            className="sr-only"
            checked={selectedLevel === "B2"}
            onChange={() => onLevelChange("B2")}
          />
          <label 
            htmlFor="level-b2" 
            className={`flex flex-col items-center px-6 py-4 border-2 rounded-xl cursor-pointer transition-colors ${
              selectedLevel === "B2" 
                ? "border-[#3498db] bg-[#3498db] text-white" 
                : "border-gray-300 hover:border-[#3498db]"
            }`}
          >
            <span className="text-2xl font-bold">B2</span>
            <span className={`text-sm ${selectedLevel === "B2" ? "text-white" : "text-gray-600"}`}>
              Upper Intermediate
            </span>
          </label>
        </div>
        
        <div className="relative">
          <input 
            type="radio" 
            id="level-c1" 
            name="level" 
            value="C1" 
            className="sr-only"
            checked={selectedLevel === "C1"}
            onChange={() => onLevelChange("C1")}
          />
          <label 
            htmlFor="level-c1" 
            className={`flex flex-col items-center px-6 py-4 border-2 rounded-xl cursor-pointer transition-colors ${
              selectedLevel === "C1" 
                ? "border-[#3498db] bg-[#3498db] text-white" 
                : "border-gray-300 hover:border-[#3498db]"
            }`}
          >
            <span className="text-2xl font-bold">C1</span>
            <span className={`text-sm ${selectedLevel === "C1" ? "text-white" : "text-gray-600"}`}>
              Advanced
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
