import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePrompts } from "./gemini";
import { promptRequestSchema, insertGameRecordSchema } from "../shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize topics if empty
  await initializeTopics();

  // Get all topics
  app.get("/api/topics", async (req, res) => {
    try {
      const topics = await storage.getAllTopics();
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Get a specific topic by ID
  app.get("/api/topics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const topic = await storage.getTopicById(id);
      
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      res.json(topic);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch topic" });
    }
  });

  // Generate prompts based on level and topic (or custom topic in Free Mode)
  app.get("/api/prompts", async (req, res) => {
    try {
      const { level, topicId, customTopic, freeMode } = req.query;
      
      if (!level || !topicId) {
        return res.status(400).json({ message: "Level and topicId are required" });
      }

      // Trim whitespace from level to avoid "B1 " invalid enum value error
      const trimmedLevel = (level as string).trim();
      const parsedLevel = z.enum(["B1", "B1+", "B2", "B2+", "C1", "C2"]).parse(trimmedLevel);
      const parsedTopicId = parseInt(topicId as string);
      
      // For Free Mode with custom topic, we don't need to fetch a topic from the database
      let topicName = "";
      
      if (freeMode === 'true' && customTopic) {
        // Use the custom topic name directly
        topicName = customTopic as string;
        console.log(`🆓 FREE MODE: Using custom topic "${topicName}" with level=${parsedLevel}`);
      } else {
        // Regular mode - fetch topic from database
        const topic = await storage.getTopicById(parsedTopicId);
        
        if (!topic) {
          return res.status(404).json({ message: "Topic not found" });
        }
        
        topicName = topic.name;
      }

      // Always generate fresh prompts if the continue=true parameter is present
      // This parameter is sent when the user completes all three stages and wants to continue practice
      const continueParam = req.query.continue === 'true';
      
      // If explicitly requesting continued practice with new prompts, bypass all cache
      if (continueParam) {
        console.log("Continue parameter detected - bypassing cache and generating fresh prompts");
      } 
      // For initial load, we can use cached prompts if they exist
      else {
        const existingPrompts = await storage.getPromptsByLevelAndTopic(parsedLevel, parsedTopicId);
        
        if (existingPrompts && existingPrompts.length > 0 && existingPrompts.length >= 3) {
          // Format into stages array, but only use the most recent 3 prompts
          // This prevents showing old prompts from previous sessions
          const recentPrompts = existingPrompts.slice(0, 3);
          
          const formattedPrompts = {
            stages: recentPrompts.map(prompt => ({
              stage: prompt.stage,
              question: prompt.question,
              context: prompt.context,
              hintWords: prompt.hintWords
            }))
          };
          
          return res.json(formattedPrompts);
        }
      }
      
      // Always log when generating new prompts
      if (continueParam) {
        console.log(`🔄 REGENERATING PROMPTS: User continued practice with level=${parsedLevel}, topic=${topicName}, continue=true`);
      } else {
        console.log(`🆕 GENERATING PROMPTS: Initial load with level=${parsedLevel}, topic=${topicName}`);
      }

      // Generate new prompts using Gemini
      const prompts = await generatePrompts(parsedLevel, topicName);
      
      // Add a session identifier to track groups of prompts generated together
      // This helps ensure diversity in future sessions
      const sessionId = `session_${Date.now()}`;
      
      // Store the generated prompts
      for (const prompt of prompts.stages) {
        await storage.createPrompt({
          topicId: parsedTopicId,
          level: parsedLevel,
          stage: prompt.stage,
          question: prompt.question, 
          context: prompt.context,
          hintWords: prompt.hintWords,
          // Add metadata to help track prompt diversity
          metadata: {
            sessionId,
            timestamp: Date.now(),
            // Track explicit theme/aspect of the topic to avoid repetition
            aspect: prompt.question.split(" ").slice(0, 8).join(" ") // Extract first few words as a simple signature
          }
        });
      }
      
      res.json(prompts);
    } catch (error) {
      console.error('Error generating prompts:', error);
      res.status(500).json({ message: "Failed to generate prompts" });
    }
  });
  
  // POST a new game record for teacher dashboard
  app.post("/api/game-records", async (req, res) => {
    try {
      // Validate request body
      const result = insertGameRecordSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid game record data",
          details: result.error.format()
        });
      }
      
      const newGameRecord = await storage.createGameRecord(result.data);
      res.status(201).json(newGameRecord);
    } catch (error) {
      console.error("Error saving game record:", error);
      res.status(500).json({ error: "Failed to save game record" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Helper function to initialize topics if none exist
async function initializeTopics() {
  const topics = await storage.getAllTopics();
  
  if (topics.length === 0) {
    const defaultTopics = [
      {
        name: "Your Class",
        description: "Teachers & classmates",
        icon: "fa-graduation-cap",
        colorClass: "accent1"
      },
      {
        name: "Childhood",
        description: "Memories & experiences",
        icon: "fa-child",
        colorClass: "secondary"
      },
      {
        name: "Travel",
        description: "Adventures & destinations",
        icon: "fa-plane",
        colorClass: "secondary"
      },
      {
        name: "Food",
        description: "Cuisine & cooking",
        icon: "fa-utensils",
        colorClass: "accent1"
      },
      {
        name: "Friendship",
        description: "Relationships & bonds",
        icon: "fa-users",
        colorClass: "accent2"
      },
      {
        name: "Technology",
        description: "Digital life & future",
        icon: "fa-laptop",
        colorClass: "primary"
      },
      {
        name: "Hobbies",
        description: "Interests & activities",
        icon: "fa-palette",
        colorClass: "secondary"
      },
      {
        name: "Movies",
        description: "Films & entertainment",
        icon: "fa-film",
        colorClass: "accent1"
      },
      {
        name: "Dreams",
        description: "Aspirations & goals",
        icon: "fa-star",
        colorClass: "accent2"
      }
    ];
    
    for (const topic of defaultTopics) {
      await storage.createTopic(topic);
    }
  }
}
