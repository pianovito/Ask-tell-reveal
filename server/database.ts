import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const db = drizzle(pool, { schema });

export const topics = schema.topics;

// Add initial topics if table is empty
export async function initializeTopics() {
  const existingTopics = await db.select().from(topics);
  if (existingTopics.length === 0) {
    await db.insert(topics).values([
      {
        name: "Your Class",
        description: "Classroom relationships & fun dynamics",
        icon: "fa-graduation-cap",
        colorClass: "accent1"
      },
      {
        name: "Childhood",
        description: "Memories & experiences",
        icon: "fa-child",
        colorClass: "secondary"
      },
      // ... other topics will follow
    ]);
  }
}