
import { useLocation } from "wouter";

interface AppHeaderProps {
  onHelpClick?: () => void;
}

export default function AppHeader({ onHelpClick }: AppHeaderProps) {
  const [, navigate] = useLocation();

  return (
    <header className="bg-gradient-to-r from-blue-100 to-green-100 shadow-md">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex-1">
          <h1 className="font-['Poppins'] font-bold text-3xl sm:text-4xl md:text-5xl text-center text-[#333333]">
            <span className="text-[#3498db]"><i className="fas fa-comments text-3xl mr-2"></i>Ask</span>,
            <span className="text-[#f39c12]">Tell</span>, 
            <span className="text-[#9b59b6]">Reveal</span>
          </h1>
          <p className="text-gray-600 text-sm mt-2 text-center">
            Ask a question, tell something about, reveal a secret
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            className="text-[#333333] hover:text-[#3498db] transition-colors"
            onClick={() => navigate("/")}
            title="Back to Home"
          >
            <i className="fas fa-home text-xl"></i>
          </button>
          <button 
            className="text-[#333333] hover:text-[#3498db] transition-colors"
            onClick={onHelpClick}
            title="Help"
          >
            <i className="fas fa-question-circle text-xl"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
