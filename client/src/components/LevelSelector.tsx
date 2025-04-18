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
        {[
          { level: "B1", label: "Intermediate" },
          { level: "B1+", label: "Upper Intermediate" },
          { level: "B2", label: "Strong Intermediate" },
          { level: "B2+", label: "Pre-Advanced" },
          { level: "C1", label: "Advanced" },
          { level: "C2", label: "Mastery" }
        ].map(({ level, label }) => (
          <div className="relative" key={level}>
            <input 
              type="radio" 
              id={`level-${level.toLowerCase().replace('+', 'plus')}`}
              name="level" 
              value={level}
              className="sr-only"
              checked={selectedLevel === level}
              onChange={() => onLevelChange(level as CEFRLevel)}
            />
            <label 
              htmlFor={`level-${level.toLowerCase().replace('+', 'plus')}`}
              className={`flex flex-col items-center px-6 py-4 border-2 rounded-xl cursor-pointer transition-colors ${
                selectedLevel === level
                  ? "border-[#3498db] bg-[#3498db] text-white" 
                  : "border-gray-300 hover:border-[#3498db]"
              }`}
            >
              <span className="text-2xl font-bold">{level}</span>
              <span className={`text-sm ${selectedLevel === level ? "text-white" : "text-gray-600"}`}>
                {label}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
