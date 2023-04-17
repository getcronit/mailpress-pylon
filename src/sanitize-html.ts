import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

export function sanitizeHtml(value: string): string {
  // Use a library like DOMPurify to sanitize the HTML value
  return purify.sanitize(value);
}
