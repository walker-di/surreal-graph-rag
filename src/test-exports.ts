/**
 * Test file to validate all export patterns work correctly
 * This file should compile without errors if the export structure is correct
 */

// Test main exports (backward compatibility)
import { add, divide, multiply } from "./lib/index.js";
import { connect, query } from "./lib/index.js";
import type { Config, User } from "./lib/index.js";
import { Button, SecondButton } from "./lib/index.js";

// Test modular exports
import { add as coreAdd } from "./lib/core/index.js";
import { connect as nodeConnect } from "./lib/node/index.js";
import type { UserId } from "./lib/types/index.js";
import { Button as UIButton } from "./lib/ui/index.js";

// Test that functions work
console.log("Testing exports:");
console.log("add(2, 3) =", add(2, 3));
console.log("multiply(4, 5) =", multiply(4, 5));

// Test connection
const conn = connect({ host: "localhost", port: 5432 });
console.log("Connection:", conn);

// Test query
const result = query("SELECT * FROM test");
console.log("Query result:", result);

// Test types
const user: User = {
	id: "123",
	name: "Test User"
};

const config: Config = {
	apiKey: "test-key",
	endpoint: "https://api.example.com"
};

console.log("User:", user);
console.log("Config:", config);

// Export a test function to verify everything works
export function testExports() {
	return {
		mathResult: add(10, 20),
		connectionId: conn.id,
		queryRows: result.rows.length,
		user,
		config
	};
}
