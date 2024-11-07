import { config } from "dotenv";

config();

export const ACCOUNT_ID = process.env.ACCOUNT_ID!;
export const CONSUMER_KEY = process.env.CONSUMER_KEY!;
export const CONSUMER_SECRET = process.env.CONSUMER_SECRET!;
export const TOKEN_ID = process.env.TOKEN_ID!;
export const TOKEN_SECRET = process.env.TOKEN_SECRET!;
