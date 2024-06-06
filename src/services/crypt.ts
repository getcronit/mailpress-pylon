import * as crypto from "crypto";

import { PYLON_SECRET } from "../config";

// Encrypt function
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16); // Generate a random IV

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(PYLON_SECRET, "hex"),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + encrypted; // Prepend IV to the ciphertext
}

// Decrypt function
export function decrypt(encryptedText: string): string {
  const iv = Buffer.from(encryptedText.slice(0, 32), "hex"); // Extract IV from ciphertext
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(PYLON_SECRET, "hex"),
    iv
  );
  let decrypted = decipher.update(encryptedText.slice(32), "hex", "utf8"); // Remove IV from ciphertext
  decrypted += decipher.final("utf8");
  return decrypted;
}
