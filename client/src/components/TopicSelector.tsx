import { useQuery } from "@tanstack/react-query";
import { Topic } from "@/lib/types";
import { motion } from "framer-motion";

interface TopicSelectorProps {
  selectedTopic: Topic | null;
  onTopicSelect: (topic: Topic) => void;
}

const topicColors = {
  primary: "bg-[#3498db]",      // Bright Blue
  secondary: "bg-[#e74c3c]",    // Coral Red
  accent1: "bg-[#2ecc71]",      // Emerald Green
  accent2: "bg-[#9b59b6]",      // Royal Purple
  accent3: "bg-[#f1c40f]",      // Golden Yellow
  accent4: "bg-[#1abc9c]",      // Turquoise
  accent5: "bg-[#e67e22]",      // Orange
  accent6: "bg-[#34495e]"       // Dark Blue Grey
};

export default function TopicSelector({ selectedTopic, onTopicSelect }: TopicSelectorProps) {
  const { data: topics, isLoading, error } = useQuery({ 
    queryKey: ['/api/topics'],
  });

  if (isLoading) {
    return (
      <div>
        <h3 className="font-['Quicksand'] font-semibold text-xl text-[#333333] mb-4">
          Choose a Conversation Topic:
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
            >
              <div className="h-32 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded mb-2 w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Error loading topics. Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-['Quicksand'] font-semibold text-xl text-[#333333] mb-4">
        Choose a Conversation Topic:
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {topics && topics.map((topic: Topic) => (
          <motion.div
            key={topic.id}
            className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all ${
              selectedTopic?.id === topic.id ? 'ring-4 ring-[#3498db]' : ''
            }`}
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => onTopicSelect(topic)}
          >
            <div className={`h-32 ${topicColors[topic.colorClass as keyof typeof topicColors] || 'bg-[#3498db]'} flex items-center justify-center`}>
              <i className={`fas ${topic.icon} text-white text-4xl`}></i>
            </div>
            <div className="p-4 text-center">
              <h4 className="font-['Quicksand'] font-semibold">{topic.name}</h4>
              <p className="text-sm text-gray-600">{topic.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
