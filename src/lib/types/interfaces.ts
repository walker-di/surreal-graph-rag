/**
 * Simple type definitions for the surreal-rag library
 * These are minimal placeholder types to demonstrate type-only exports
 */

/**
 * Simple user type
 */
export interface User {
	id: string;
	name: string;
	email?: string;
	createdAt?: Date;
}

/**
 * Simple config type
 */
export interface Config {
	apiKey: string;
	endpoint: string;
	timeout?: number;
	retries?: number;
}

/**
 * Simple document type for RAG operations
 */
export interface Document {
	id: string;
	content: string;
	metadata?: Record<string, any>;
	embedding?: number[];
}

/**
 * Simple collection type
 */
export interface Collection {
	id: string;
	name: string;
	description?: string;
	documents: Document[];
}

/**
 * Simple search options type
 */
export interface SearchOptions {
	query: string;
	limit?: number;
	threshold?: number;
	filters?: Record<string, any>;
}

/**
 * Simple search result type
 */
export interface SearchResult {
	document: Document;
	score: number;
	highlights?: string[];
}
