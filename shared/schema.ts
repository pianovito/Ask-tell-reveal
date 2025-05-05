import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema remains unchanged
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define the ESL practice schemas
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  colorClass: text("color_class").notNull(),
});

export const insertTopicSchema = createInsertSchema(topics).pick({
  name: true,
  description: true,
  icon: true, 
  colorClass: true
});

export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topics.$inferSelect;

// Prompts schema for storing prompts
export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull(),
  level: text("level").notNull(), // B1, B2, C1
  stage: text("stage").notNull(), // Ask, Tell, Reveal
  question: text("question").notNull(),
  context: text("context").notNull(),
  hintWords: text("hint_words").array().notNull(),
  metadata: json("metadata").default({}).notNull(), // Store session info, timestamps, and other metadata
});

export const insertPromptSchema = createInsertSchema(prompts).pick({
  topicId: true,
  level: true,
  stage: true,
  question: true,
  context: true,
  hintWords: true,
  metadata: true
});

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;

// Zod schema for prompt request
export const promptRequestSchema = z.object({
  level: z.enum(["B1", "B2", "C1"]),
  topicName: z.string(),
});

export type PromptRequest = z.infer<typeof promptRequestSchema>;

// Zod schema for prompt response
export const promptResponseSchema = z.object({
  stages: z.array(
    z.object({
      stage: z.enum(["Ask", "Tell", "Reveal"]),
      question: z.string(),
      context: z.string(),
      hintWords: z.array(z.string())
    })
  )
});

export type PromptResponse = z.infer<typeof promptResponseSchema>;

// Game record schema for tracking completed games in teacher dashboard
export const gameRecords = pgTable("game_records", {
  id: serial("id").primaryKey(),
  studentName: text("student_name").notNull(),
  classId: text("class_id"),
  level: text("level").notNull(),
  topicId: integer("topic_id").references(() => topics.id).notNull(),
  topicName: text("topic_name").notNull(),
  score: integer("score").default(0), // Score field made optional with default of 0
  achievementsUnlocked: integer("achievements_unlocked").default(0), // Made optional with default of 0
  keywordsUsed: integer("keywords_used").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  roundsCompleted: integer("rounds_completed").notNull()
});

export const insertGameRecordSchema = createInsertSchema(gameRecords);

export type InsertGameRecord = z.infer<typeof insertGameRecordSchema>;
export type GameRecord = typeof gameRecords.$inferSelect;
