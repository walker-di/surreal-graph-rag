// src/lib/server/chunking.ts
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 200;
export const CHUNK_SEPARATORS = [
  "\n\n",
  "\n",
  " ",
  ".",
  ",",
  "\u200b",
  "\uff0c",
  "\u3001",
  "\uff0e",
  "\u3002",
  "",
] as const;

export function buildTextSplitter() {
  return new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    separators: [...CHUNK_SEPARATORS],
  });
}
