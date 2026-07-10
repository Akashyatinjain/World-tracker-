import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.join(__dirname, "..", "frontend", "dist");
const dest = path.join(__dirname, "..", "dist");

try {
  // Delete existing dest folder if any
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  
  // Copy folder recursively
  fs.cpSync(src, dest, { recursive: true });
  console.log("Successfully copied frontend/dist to root dist folder!");
} catch (err) {
  console.error("Error copying dist folder:", err);
  process.exit(1);
}
