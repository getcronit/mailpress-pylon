import { randomBytes } from "crypto";

export const PYLON_URL = process.env.PYLON_URL || "http://localhost:3000";
export const PYLON_SECRET =
  process.env.PYLON_SECRET || randomBytes(32).toString("hex"); // 32 bytes for AES-256
