import { GoogleGenerativeAI } from "@google/generative-ai";
import { type PromptResponse } from "../shared/schema";

// Initialize the Google Generative AI with API key from environment variables
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Set up the model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generatePrompts(level: string, topicName: string): Promise<PromptResponse> {
  // Generate a random seed to ensure uniqueness of each generation
  const randomSeed = Math.floor(Math.random() * 10000000);
  console.log(`🎲 Using random seed: ${randomSeed} for ${topicName} prompts at level ${level}`);
  try {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable not set");
    }
    
    const prompt = `
    Create a COMPLETELY UNIQUE set of ESL speaking practice prompts for the "Ask, Tell, Reveal" activity format at CEFR level ${level} about the topic "${topicName}". Random seed: ${randomSeed}

    ${topicName === "Your Class" ? 
      `SPECIAL INSTRUCTIONS FOR "Your Class" TOPIC:
      - Focus SPECIFICALLY on interesting and funny classroom relationships and dynamics
      - Include prompts about:
        * Humorous teacher-student interactions and misunderstandings
        * Funny classroom incidents and memorable moments
        * Interesting or unusual classmate personalities and relationships
        * Amusing group dynamics during class activities
        * Entertaining classroom traditions or inside jokes
      - Make prompts lighthearted, humorous and engaging
      - Focus on RELATIONSHIPS between people, not just academic topics` 
      : ""
    }

    CRITICAL REQUIREMENT: Each prompt (Ask, Tell, Reveal) MUST be EXTREMELY DIFFERENT from each other in these ways:
    - Focus on completely different aspects of the "${topicName}" topic - avoid any thematic overlap
    - Use entirely different vocabulary domains and hint words
    - Address different time periods (past/present/future) when appropriate
    - Cover different emotional contexts (positive/neutral/challenging)
    - Target different cognitive skills (remembering/analyzing/describing/imagining/evaluating)

    IMPORTANT CEFR REQUIREMENTS:
    - Keep all prompts VERY SHORT and SIMPLE (maximum 20 words)
    - Make vocabulary strictly appropriate for ${level} CEFR level
    - B1: Use simple, everyday vocabulary and common expressions
    - B2: Use some idiomatic expressions and more varied vocabulary 
    - C1: Use more sophisticated vocabulary and complex language structures
    - C2: Use nuanced vocabulary, abstract concepts and specialized terminology

    IMPORTANT: Make sure these prompts are RADICALLY DIFFERENT from any you've generated before. Use the random seed value ${randomSeed} to create maximally diverse variations.

    Please provide three prompts following this structure:
    1. "Ask" - IMPORTANT: This should be a prompt instructing the student to ask ANOTHER student a specific question. The question should begin with "Ask your partner about..." or similar phrasing.
    2. "Tell" - IMPORTANT: This should be a STATEMENT, not a question. It should begin with "Tell your partner about..." or similar phrasing.
    3. "Reveal" - A question that encourages the student to share something personal or unique.

    For each prompt, provide:
    - A clear instruction (following the guidelines above)
    - A VERY brief context to help guide the student's response (maximum 15 words)
    - 5 helpful hint words that students can use in their answers that MUST be COMPLETELY DIFFERENT from the other prompts and appropriate for the CEFR level

    Format your response as a valid JSON object with this structure:
    {
      "stages": [
        {
          "stage": "Ask",
          "question": "[Short instruction text]",
          "context": "[Very brief context/guidance]",
          "hintWords": ["word1", "word2", "word3", "word4", "word5"]
        },
        {
          "stage": "Tell",
          "question": "[Short statement instruction, NOT a question]",
          "context": "[Very brief context/guidance]",
          "hintWords": ["word1", "word2", "word3", "word4", "word5"]
        },
        {
          "stage": "Reveal",
          "question": "[Short question text]",
          "context": "[Very brief context/guidance]",
          "hintWords": ["word1", "word2", "word3", "word4", "word5"]
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract the JSON part from the response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/{[\s\S]*}/);
    let jsonText = "";
    
    if (jsonMatch) {
      jsonText = jsonMatch[0].replace(/```json|```/g, '').trim();
    } else {
      jsonText = text;
    }

    // Parse the JSON
    const data = JSON.parse(jsonText);
    return data as PromptResponse;
  } catch (error) {
    console.error("Error generating prompts with Gemini:", error);
    
    // Fallback prompts if API fails
    if (topicName === "Your Class") {
      // Special fallback prompts for "Your Class" topic focused on funny and interesting relationships
      return {
        stages: [
          {
            stage: "Ask",
            question: "Ask your partner about a funny moment with a teacher.",
            context: "Think about humorous classroom situations.",
            hintWords: ["amusing", "laugh", "accident", "joke", "surprise"]
          },
          {
            stage: "Tell",
            question: "Tell your partner about your class's special tradition.",
            context: "Share something unique your class does together.",
            hintWords: ["routine", "special", "together", "memory", "bond"]
          },
          {
            stage: "Reveal",
            question: "Which classmate changes the classroom atmosphere the most?",
            context: "Think about someone who brings energy to the class.",
            hintWords: ["lively", "energy", "change", "impact", "feel"]
          }
        ]
      };
    } else {
      // Standard fallback prompts for other topics
      return {
        stages: [
          {
            stage: "Ask",
            question: `Ask your partner about their best ${topicName} experience.`,
            context: `Focus on a specific memory they have.`,
            hintWords: ["memory", "enjoy", "specific", "time", "place"]
          },
          {
            stage: "Tell",
            question: `Tell your partner about how ${topicName} is part of your life.`,
            context: "Share your personal connection to the topic.",
            hintWords: ["daily", "habit", "routine", "connect", "regular"]
          },
          {
            stage: "Reveal",
            question: `What surprising opinion do you have about ${topicName}?`,
            context: "Share a thought others might not expect.",
            hintWords: ["unusual", "different", "opinion", "surprise", "believe"]
          }
        ]
      };
    }
  }
}
