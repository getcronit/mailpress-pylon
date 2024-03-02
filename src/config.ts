import { generateKeySync } from "crypto";

export const PYLON_URL = process.env.PYLON_URL || "http://localhost:3000";
export const PYLON_SECRET =
  process.env.PYLON_SECRET ||
  generateKeySync("hmac", {
    length: 32,
  })
    .export()
    .toString("base64");
