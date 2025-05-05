import { users, type User, type InsertUser } from "@shared/schema";
import { topics, type Topic, type InsertTopic } from "@shared/schema";
import { prompts, type Prompt, type InsertPrompt } from "@shared/schema";
import { gameRecords, type GameRecord, type InsertGameRecord } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Topic methods
  getAllTopics(): Promise<Topic[]>;
  getTopicById(id: number): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  
  // Prompt methods
  getPromptsByLevelAndTopic(level: string, topicId: number): Promise<Prompt[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;

  // Game record methods
  getGameRecordsByClassId(classId: string): Promise<GameRecord[]>;
  getGameRecordsByStudentName(studentName: string): Promise<GameRecord[]>;
  createGameRecord(gameRecord: InsertGameRecord): Promise<GameRecord>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Topic methods
  async getAllTopics(): Promise<Topic[]> {
    return await db.select().from(topics);
  }
  
  async getTopicById(id: number): Promise<Topic | undefined> {
    const result = await db.select().from(topics).where(eq(topics.id, id)).limit(1);
    return result[0];
  }
  
  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const result = await db.insert(topics).values(insertTopic).returning();
    return result[0];
  }
  
  // Prompt methods
  async getPromptsByLevelAndTopic(level: string, topicId: number): Promise<Prompt[]> {
    return await db.select()
      .from(prompts)
      .where(
        and(
          eq(prompts.level, level),
          eq(prompts.topicId, topicId)
        )
      );
  }
  
  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    // Create a typed prompt object to ensure it matches the schema
    const typedPromptData: typeof insertPrompt = {
      topicId: insertPrompt.topicId,
      level: insertPrompt.level,
      stage: insertPrompt.stage,
      question: insertPrompt.question,
      context: insertPrompt.context,
      hintWords: insertPrompt.hintWords
    };
    
    const result = await db.insert(prompts).values(typedPromptData).returning();
    return result[0];
  }

  // Game record methods
  async getGameRecordsByClassId(classId: string): Promise<GameRecord[]> {
    return await db.select()
      .from(gameRecords)
      .where(eq(gameRecords.classId, classId));
  }

  async getGameRecordsByStudentName(studentName: string): Promise<GameRecord[]> {
    return await db.select()
      .from(gameRecords)
      .where(eq(gameRecords.studentName, studentName));
  }

  async createGameRecord(insertGameRecord: InsertGameRecord): Promise<GameRecord> {
    const result = await db.insert(gameRecords).values(insertGameRecord).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
