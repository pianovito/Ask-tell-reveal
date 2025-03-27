import { GoogleGenerativeAI } from "@google/generative-ai";
import { type PromptResponse } from "../shared/schema";

// Initialize the Google Generative AI with API key from environment variables
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Set up the model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generatePrompts(level: string, topicName: string): Promise<PromptResponse> {
  try {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable not set");
    }
    
    const prompt = `
    Create a set of ESL speaking practice prompts for the "Ask, Tell, Reveal" activity format at CEFR level ${level} about the topic "${topicName}".

    Please provide three prompts following this structure:
    1. "Ask" - IMPORTANT: This should be a prompt instructing the student to ask ANOTHER student a specific question. The question should begin with "Ask your partner about..." or similar phrasing.
    2. "Tell" - A deeper follow-up question that requires more detailed responses.
    3. "Reveal" - A question that encourages the student to share something personal or unique.

    For each prompt, provide:
    - A clear question (remember "Ask" must instruct the student to ask ANOTHER student something)
    - A brief context to help guide the student's response
    - 5 helpful hint words that students can use in their answers

    Format your response as a valid JSON object with this structure:
    {
      "stages": [
        {
          "stage": "Ask",
          "question": "[Question text]",
          "context": "[Brief context/guidance]",
          "hintWords": ["word1", "word2", "word3", "word4", "word5"]
        },
        {
          "stage": "Tell",
          "question": "[Question text]",
          "context": "[Brief context/guidance]",
          "hintWords": ["word1", "word2", "word3", "word4", "word5"]
        },
        {
          "stage": "Reveal",
          "question": "[Question text]",
          "context": "[Brief context/guidance]",
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
    return {
      stages: [
        {
          stage: "Ask",
          question: `Ask your partner about their experiences with ${topicName}.`,
          context: `Think about interesting aspects of ${topicName} you'd like to learn about from your partner.`,
          hintWords: ["experiences", "memorable", "opinion", "specific", "feelings"]
        },
        {
          stage: "Tell",
          question: `How has ${topicName} influenced or changed your life?`,
          context: "Consider both positive and negative impacts.",
          hintWords: ["impact", "change", "perspective", "significant", "reflection"]
        },
        {
          stage: "Reveal",
          question: `What's something about ${topicName} that you've never shared with others before?`,
          context: "This can be a personal story, opinion, or realization.",
          hintWords: ["secret", "personal", "unique", "surprising", "confession"]
        }
      ]
    };
  }
}
