/**
 * Main entry point for surreal-rag library
 * Provides backward compatibility and convenient imports
 */

// Re-export core utilities
export * from "./core/index.js";

// Re-export simple types
export type { Config, User, Document, Collection, SearchOptions, SearchResult } from "./types/index.js";

// Re-export Node.js functionality (will be tree-shaken in browser builds)
export * from "./node/index.js";

// Re-export UI components
export * from "./ui/index.js";

// You can also provide convenience exports
export { add as sum } from "./core/math.js"; // Alias example
