/**
 * Simple math utility functions for the surreal-rag library
 * These are placeholder implementations to demonstrate the export structure
 */

/**
 * Adds two numbers together
 * @param a - First number
 * @param b - Second number
 * @returns The sum of a and b
 */
export function add(a: number, b: number): number {
	return a + b;
}

/**
 * Multiplies two numbers
 * @param a - First number
 * @param b - Second number
 * @returns The product of a and b
 */
export function multiply(a: number, b: number): number {
	return a * b;
}

/**
 * Divides two numbers
 * @param a - Dividend
 * @param b - Divisor
 * @returns The quotient of a divided by b
 * @throws Error if b is zero
 */
export function divide(a: number, b: number): number {
	if (b === 0) {
		throw new Error('Division by zero is not allowed');
	}
	return a / b;
}

/**
 * Subtracts two numbers
 * @param a - First number
 * @param b - Second number
 * @returns The difference of a minus b
 */
export function subtract(a: number, b: number): number {
	return a - b;
}
