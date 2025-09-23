import path from "path";
import { fileURLToPath } from "url";

/**
 * Get the project root directory (where package.json is located)
 * Works from any file in the project
 */
export function getProjectRoot(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // From src/utils/ go up two levels to reach project root
  return path.resolve(__dirname, "..", "..");
}

/**
 * Get path to credentials.json in project root
 */
export function getCredentialsPath(): string {
  return path.join(getProjectRoot(), "credentials.json");
}

/**
 * Get path to gtm-config.json in project root
 */
export function getConfigPath(): string {
  return path.join(getProjectRoot(), "gtm-config.json");
}
