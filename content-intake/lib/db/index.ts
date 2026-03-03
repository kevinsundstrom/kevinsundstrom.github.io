import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "./schema";

// Required for Neon serverless in Node.js environments
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.POSTGRES_URL! });

export const db = drizzle(pool, { schema });
