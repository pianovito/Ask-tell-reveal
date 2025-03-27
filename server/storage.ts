import { users, type User, type InsertUser } from "@shared/schema";
import { topics, type Topic, type InsertTopic } from "@shared/schema";
import { prompts, type Prompt, type InsertPrompt } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private topics: Map<number, Topic>;
  private prompts: Map<number, Prompt>;
  userCurrentId: number;
  topicCurrentId: number;
  promptCurrentId: number;

  constructor() {
    this.users = new Map();
    this.topics = new Map();
    this.prompts = new Map();
    this.userCurrentId = 1;
    this.topicCurrentId = 1;
    this.promptCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Topic methods
  async getAllTopics(): Promise<Topic[]> {
    return Array.from(this.topics.values());
  }
  
  async getTopicById(id: number): Promise<Topic | undefined> {
    return this.topics.get(id);
  }
  
  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const id = this.topicCurrentId++;
    const topic: Topic = { ...insertTopic, id };
    this.topics.set(id, topic);
    return topic;
  }
  
  // Prompt methods
  async getPromptsByLevelAndTopic(level: string, topicId: number): Promise<Prompt[]> {
    return Array.from(this.prompts.values()).filter(
      (prompt) => prompt.level === level && prompt.topicId === topicId
    );
  }
  
  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = this.promptCurrentId++;
    const prompt: Prompt = { ...insertPrompt, id };
    this.prompts.set(id, prompt);
    return prompt;
  }
}

export const storage = new MemStorage();
