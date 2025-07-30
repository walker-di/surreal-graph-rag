# Separate Library Export Plan - Detailed Implementation Guide

## Overview

This plan outlines how to restructure the `surreal-rag` library to support
modular exports with separate entry points for different functionality areas.
This will enable users to import only what they need, reducing bundle size and
improving developer experience.

**Important Note**: At this stage, we are focusing solely on implementing the
separate export feature and package structure. All components and functions will
be placeholders with simple implementations (like basic `add` functions) to
demonstrate the export patterns. The actual RAG functionality will be
implemented in later phases.

## Why This Approach?

1. **Modular Architecture**: Users can import only what they need
   (`import { add } from "surreal-rag/core"` instead of importing everything)
2. **Better Tree Shaking**: Bundlers can eliminate unused code more effectively
3. **Platform-Specific Code**: Separate Node.js and browser code paths
4. **Type Safety**: Dedicated types module with proper TypeScript support
5. **Component Reusability**: Dedicated UI module for Svelte components

## Target Import Structure (Placeholder Implementation)

```ts
// Node.js/Server functionality (placeholder functions)
import { connect, database, query } from "surreal-rag/node";

// Type definitions and interfaces (basic types)
import { Collection, Document, SearchOptions } from "surreal-rag/types";

// UI components (placeholder Svelte components)
import { CollectionView, ResultsList, SearchInput } from "surreal-rag/ui";

// Core utilities (simple math functions for demonstration)
import { add, divide, multiply } from "surreal-rag/core";
```

## Current State Analysis

Based on the codebase analysis:

- Current `package.json` has basic exports configuration pointing to
  `./dist/index.js`
- `src/lib/index.ts` is currently empty (just a comment)
- Project is set up as a SvelteKit library with `@sveltejs/package`
- Uses TypeScript and has proper build tooling configured

## Implementation Plan

### 1. Directory Structure Reorganization

Create modular structure in `src/lib/` with placeholder implementations:

```
src/lib/
├── index.ts                 # Main export (backward compatibility)
├── core/                    # Core utilities (simple math functions)
│   ├── index.ts
│   └── math.ts            # placeholder utility functions
├── node/                    # Node.js specific functionality (placeholders)
│   ├── index.ts
│   └── connect.ts           # placeholder connect function
├── types/                   # TypeScript definitions (basic interfaces)
│   ├── index.ts
│   └── connections.ts      # placeholder interface
└── ui/                     # Svelte UI components (placeholder components)
    ├── index.ts
    └── Button.svelte       # placeholder component
```

### 2. Package.json Exports Configuration

Update `package.json` to support subpath exports using Node.js exports patterns:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./core": {
      "types": "./dist/core/index.d.ts",
      "import": "./dist/core/index.js",
      "default": "./dist/core/index.js"
    },
    "./node": {
      "types": "./dist/node/index.d.ts",
      "import": "./dist/node/index.js",
      "default": "./dist/node/index.js"
    },
    "./types": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/types/index.js",
      "default": "./dist/types/index.js"
    },
    "./ui": {
      "types": "./dist/ui/index.d.ts",
      "svelte": "./dist/ui/index.js",
      "default": "./dist/ui/index.js"
    }
  },
  "typesVersions": {
    ">4.0": {
      "core": ["./dist/core/index.d.ts"],
      "node": ["./dist/node/index.d.ts"],
      "types": ["./dist/types/index.d.ts"],
      "ui": ["./dist/ui/index.d.ts"]
    }
  }
}
```

### 3. Detailed Step-by-Step Implementation Guide

This section provides exact instructions for implementing the separate export
feature. Each step includes the specific files to create/modify, the exact
content to add, and explanations of why each change is necessary.

#### Step 1: Create Core Module with Placeholder Math Functions

**Purpose**: Demonstrate basic utility exports that can be imported as
`import { add } from "surreal-rag/core"`

**Files to Create:**

1. **Create file: `src/lib/core/math.ts`**
   ```typescript
   /**
    * Simple math utility functions for demonstration purposes.
    * These are placeholder implementations to show the export pattern.
    */

   /**
    * Adds two numbers together
    * @param a First number
    * @param b Second number
    * @returns Sum of a and b
    */
   export function add(a: number, b: number): number {
     return a + b;
   }

   /**
    * Multiplies two numbers
    * @param a First number
    * @param b Second number
    * @returns Product of a and b
    */
   export function multiply(a: number, b: number): number {
     return a * b;
   }

   /**
    * Divides first number by second number
    * @param a Dividend
    * @param b Divisor
    * @returns Quotient of a divided by b
    * @throws Error if divisor is zero
    */
   export function divide(a: number, b: number): number {
     if (b === 0) {
       throw new Error("Division by zero is not allowed");
     }
     return a / b;
   }
   ```

2. **Create file: `src/lib/core/index.ts`**
   ```typescript
   /**
    * Core utilities module
    * Exports basic utility functions for mathematical operations
    */

   // Re-export all math functions
   export * from "./math.js";

   // You can also do named exports if you want to be more selective:
   // export { add, multiply, divide } from './math.js';
   ```

**Why this structure?**

- The `math.ts` file contains the actual implementations
- The `index.ts` file serves as the module's entry point and re-exports
  everything
- This allows users to import either `import { add } from "surreal-rag/core"` or
  `import { add } from "surreal-rag/core/math"`
- The `.js` extension in imports is required for ESM compatibility

#### Step 2: Create Node.js Module with Placeholder Server Functions

**Purpose**: Demonstrate server-side specific exports that won't be bundled in
browser builds

**Files to Create:**

1. **Create file: `src/lib/node/connection.ts`**
   ```typescript
   /**
    * Placeholder connection utilities for Node.js environments
    * These demonstrate server-side specific functionality
    */

   export interface ConnectionConfig {
     host: string;
     port: number;
     database?: string;
   }

   export interface Connection {
     id: string;
     host: string;
     port: number;
     connected: boolean;
   }

   /**
    * Creates a placeholder connection to a database
    * @param config Connection configuration
    * @returns Mock connection object
    */
   export function connect(config: ConnectionConfig): Connection {
     // This is a placeholder implementation
     return {
       id: `conn_${Date.now()}`,
       host: config.host,
       port: config.port,
       connected: true,
     };
   }

   /**
    * Placeholder database access function
    * @param connection Connection object
    * @returns Mock database object
    */
   export function database(connection: Connection) {
     return {
       name: connection.host,
       tables: ["users", "documents", "collections"],
       query: (sql: string) => {
         console.log(`Executing query: ${sql}`);
         return { rows: [], count: 0 };
       },
     };
   }
   ```

2. **Create file: `src/lib/node/index.ts`**
   ```typescript
   /**
    * Node.js specific functionality
    * This module should only be imported in server-side code
    */

   // Re-export connection utilities
   export * from "./connection.js";

   /**
    * Simple query function placeholder
    * @param sql SQL query string
    * @returns Mock query result
    */
   export function query(sql: string) {
     console.log(`Query executed: ${sql}`);
     return {
       success: true,
       data: [],
       message: "Placeholder query execution",
     };
   }
   ```

**Why this structure?**

- Separates Node.js specific code that shouldn't be bundled for browsers
- Provides clear server-side functionality that can be conditionally exported
- The connection utilities demonstrate more complex object-based APIs

#### Step 3: Create Types Module with Basic Interfaces

**Purpose**: Provide TypeScript type definitions that can be imported separately
for better type safety

**Files to Create:**

1. **Create file: `src/lib/types/interfaces.ts`**
   ```typescript
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
   }

   /**
    * Simple config type
    */
   export interface Config {
     apiKey: string;
     endpoint: string;
   }
   ```

2. **Create file: `src/lib/types/index.ts`**
   ```typescript
   /**
    * Type definitions module
    * Exports all TypeScript interfaces and types
    */

   // Export all interfaces
   export * from "./interfaces.js";

   // Simple utility types
   export type UserId = string;
   export type ApiKey = string;
   ```

**Why this structure?**

- Separates type definitions from implementation code
- Allows for type-only imports:
  `import type { Document } from "surreal-rag/types"`
- Provides a clean API for TypeScript users
- Can be imported without any runtime overhead

#### Step 4: Create UI Module with Simple Button Components

**Purpose**: Demonstrate Svelte component exports with minimal button components

**Files to Create:**

1. **Create file: `src/lib/ui/Button.svelte`**
   ```svelte
   <script lang="ts">
     /**
      * Simple button component
      * Minimal placeholder to demonstrate Svelte component export
      */

     export let text: string = 'Click me';
     export let disabled: boolean = false;
   </script>

   <button {disabled} on:click>
     {text}
   </button>

   <style>
     button {
       padding: 0.5rem 1rem;
       border: 1px solid #ccc;
       border-radius: 4px;
       background: #f0f0f0;
       cursor: pointer;
     }

     button:hover {
       background: #e0e0e0;
     }

     button:disabled {
       opacity: 0.5;
       cursor: not-allowed;
     }
   </style>
   ```

2. **Create file: `src/lib/ui/SecondButton.svelte`**
   ```svelte
   <script lang="ts">
     /**
      * Another simple button component
      * Shows multiple component exports
      */

     export let label: string = 'Second Button';
     export let color: string = 'blue';
   </script>

   <button class="btn" class:blue={color === 'blue'} class:red={color === 'red'} on:click>
     {label}
   </button>

   <style>
     .btn {
       padding: 0.5rem 1rem;
       border: none;
       border-radius: 4px;
       cursor: pointer;
       font-weight: bold;
     }

     .blue {
       background: #007bff;
       color: white;
     }

     .red {
       background: #dc3545;
       color: white;
     }
   </style>
   ```

3. **Create file: `src/lib/ui/index.ts`**
   ```typescript
   /**
    * UI components module
    * Exports simple button components
    */

   // Export simple button components
   export { default as Button } from "./Button.svelte";
   export { default as SecondButton } from "./SecondButton.svelte";
   ```

**Why this structure?**

- Demonstrates how to export Svelte components from a library
- Shows proper TypeScript integration with component props
- Provides reusable UI components that can be imported individually
- Includes proper styling and event handling patterns

#### Step 5: Update Main Index for Backward Compatibility

**Purpose**: Provide a main entry point that re-exports commonly used
functionality for backward compatibility

**File to Modify:**

1. **Update file: `src/lib/index.ts`**
   ```typescript
   /**
    * Main entry point for surreal-rag library
    * Provides backward compatibility and convenient imports
    */

   // Re-export core utilities
   export * from "./core/index.js";

   // Re-export simple types
   export type { Config, User } from "./types/index.js";

   // Re-export Node.js functionality (will be tree-shaken in browser builds)
   export * from "./node/index.js";

   // Re-export UI components
   export * from "./ui/index.js";

   // You can also provide convenience exports
   export { add as sum } from "./core/math.js"; // Alias example
   ```

**Why this approach?**

- Maintains backward compatibility for existing users
- Provides a convenient "everything" import option
- Tree shaking will still work to eliminate unused code
- Allows gradual migration to modular imports

#### Step 6: Update Package.json with Complete Exports Configuration

**Purpose**: Configure package.json to support all the new subpath exports with
proper TypeScript support

**File to Modify:**

1. **Update file: `package.json`** - Replace the current `exports` section with:
   ```json
   {
     "name": "surreal-rag",
     "version": "0.0.1",
     "type": "module",
     "scripts": {
       "dev": "vite dev",
       "build": "vite build && npm run prepack",
       "preview": "vite preview",
       "prepare": "svelte-kit sync || echo ''",
       "prepack": "svelte-kit sync && svelte-package && publint",
       "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
       "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
       "test:e2e": "playwright test",
       "test": "npm run test:e2e && npm run test:unit -- --run",
       "test:unit": "vitest"
     },
     "exports": {
       ".": {
         "types": "./dist/index.d.ts",
         "svelte": "./dist/index.js",
         "default": "./dist/index.js"
       },
       "./core": {
         "types": "./dist/core/index.d.ts",
         "import": "./dist/core/index.js",
         "default": "./dist/core/index.js"
       },
       "./node": {
         "types": "./dist/node/index.d.ts",
         "node": "./dist/node/index.js",
         "import": "./dist/node/index.js",
         "default": "./dist/node/index.js"
       },
       "./types": {
         "types": "./dist/types/index.d.ts",
         "import": "./dist/types/index.js",
         "default": "./dist/types/index.js"
       },
       "./ui": {
         "types": "./dist/ui/index.d.ts",
         "svelte": "./dist/ui/index.js",
         "default": "./dist/ui/index.js"
       }
     },
     "files": [
       "dist",
       "!dist/**/*.test.*",
       "!dist/**/*.spec.*"
     ],
     "sideEffects": [
       "**/*.css"
     ],
     "svelte": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "typesVersions": {
       ">4.0": {
         "core": ["./dist/core/index.d.ts"],
         "node": ["./dist/node/index.d.ts"],
         "types": ["./dist/types/index.d.ts"],
         "ui": ["./dist/ui/index.d.ts"]
       }
     },
     "peerDependencies": {
       "svelte": "^5.0.0"
     },
     "devDependencies": {
       "@playwright/test": "^1.49.1",
       "@sveltejs/adapter-vercel": "^5.6.3",
       "@sveltejs/kit": "^2.22.0",
       "@sveltejs/package": "^2.0.0",
       "@sveltejs/vite-plugin-svelte": "^6.0.0",
       "@tailwindcss/forms": "^0.5.9",
       "@tailwindcss/typography": "^0.5.15",
       "@tailwindcss/vite": "^4.0.0",
       "@vitest/browser": "^3.2.3",
       "playwright": "^1.53.0",
       "publint": "^0.3.2",
       "svelte": "^5.0.0",
       "svelte-check": "^4.0.0",
       "tailwindcss": "^4.0.0",
       "typescript": "^5.0.0",
       "vite": "^7.0.4",
       "vite-plugin-devtools-json": "^0.2.0",
       "vitest": "^3.2.3",
       "vitest-browser-svelte": "^0.1.0"
     },
     "keywords": [
       "svelte",
       "rag",
       "vector-search",
       "typescript"
     ],
     "dependencies": {
       "@inlang/paraglide-js": "^2.0.0"
     }
   }
   ```

**Key Changes Explained:**

1. **Exports Field**:
   - Each subpath (`./core`, `./node`, etc.) has its own export configuration
   - `types` field points to TypeScript definitions
   - `svelte` condition for Svelte components
   - `node` condition for Node.js specific code
   - `import`/`default` for standard ES modules

2. **typesVersions Field**:
   - Maps subpath imports to their TypeScript definition files
   - Required for TypeScript to resolve types for imports like
     `import { add } from "surreal-rag/core"`

3. **Files Array**:
   - Includes the `dist` directory for distribution
   - Excludes test files to keep package size small

4. **sideEffects**:
   - Marks CSS files as having side effects
   - Helps bundlers with tree shaking decisions

#### Step 7: Create Test Files to Validate Exports

**Purpose**: Verify that all import patterns work correctly

**Files to Create:**

1. **Create file: `src/test-exports.ts`** (for testing during development)
   ```typescript
   /**
    * Test file to validate all export patterns work correctly
    * This file should be deleted before publishing
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
   ```

**Why create test files?**

- Validates that all import patterns work during development
- Catches TypeScript errors early
- Ensures the export configuration is correct
- Can be run with `npm run check` to verify types

### 4. Execution Checklist for Junior Developers

This checklist ensures you complete all steps correctly and in the right order:

#### Phase 1: Create Directory Structure and Files

- [ ] **Step 1.1**: Create `src/lib/core/math.ts` with the exact content
      provided above
- [ ] **Step 1.2**: Create `src/lib/core/index.ts` with the exact content
      provided above
- [ ] **Step 2.1**: Create `src/lib/node/connection.ts` with the exact content
      provided above
- [ ] **Step 2.2**: Create `src/lib/node/index.ts` with the exact content
      provided above
- [ ] **Step 3.1**: Create `src/lib/types/interfaces.ts` with the exact content
      provided above
- [ ] **Step 3.2**: Create `src/lib/types/index.ts` with the exact content
      provided above
- [ ] **Step 4.1**: Create `src/lib/ui/Button.svelte` with the exact content
      provided above
- [ ] **Step 4.2**: Create `src/lib/ui/SecondButton.svelte` with the exact
      content provided above
- [ ] **Step 4.3**: Create `src/lib/ui/index.ts` with the exact content provided
      above

#### Phase 2: Update Configuration Files

- [ ] **Step 5.1**: Update `src/lib/index.ts` with the exact content provided
      above
- [ ] **Step 6.1**: Update `package.json` with the new exports configuration
      provided above
- [ ] **Step 7.1**: Create `src/test-exports.ts` for validation (temporary file)

#### Phase 3: Build and Validate

- [ ] **Step 8.1**: Run `npm run check` to verify TypeScript compilation
- [ ] **Step 8.2**: Run `npm run build` to build the library
- [ ] **Step 8.3**: Check that `dist/` directory contains all expected
      subdirectories
- [ ] **Step 8.4**: Verify that `.d.ts` files are generated for all modules
- [ ] **Step 8.5**: Run `npm run prepack` to validate package configuration

#### Phase 4: Test Import Patterns

- [ ] **Step 9.1**: Test main import: `import { add } from './lib/index.js'`
- [ ] **Step 9.2**: Test core import:
      `import { add } from './lib/core/index.js'`
- [ ] **Step 9.3**: Test node import:
      `import { connect } from './lib/node/index.js'`
- [ ] **Step 9.4**: Test types import:
      `import type { Document } from './lib/types/index.js'`
- [ ] **Step 9.5**: Test UI import: `import { Button } from './lib/ui/index.js'`

#### Common Issues and Solutions

**Issue**: TypeScript errors about `.js` extensions in imports **Solution**:
This is correct for ESM compatibility. TypeScript will resolve `.ts` files
automatically.

**Issue**: Build fails with module resolution errors **Solution**: Ensure all
`index.ts` files are created and have proper exports.

**Issue**: Svelte components not building correctly **Solution**: Verify that
`@sveltejs/package` is installed and `svelte-package` command runs successfully.

**Issue**: Types not resolving for subpath imports **Solution**: Check that
`typesVersions` field in package.json matches your export paths exactly.

### 5. Validation Commands

Run these commands to verify everything works:

```bash
# 1. Check TypeScript compilation
npm run check

# 2. Build the library
npm run build

# 3. Validate package configuration
npm run prepack

# 4. Check for common packaging issues
npx publint

# 5. Test the built package structure
ls -la dist/
ls -la dist/core/
ls -la dist/node/
ls -la dist/types/
ls -la dist/ui/
```

### 6. Expected Results After Implementation

After completing all steps, you should have:

1. **Working Import Patterns**:
   ```typescript
   // All of these should work without errors:
   import { add } from "surreal-rag/core";
   import { connect } from "surreal-rag/node";
   import type { User } from "surreal-rag/types";
   import { Button } from "surreal-rag/ui";
   import { add, Button, User } from "surreal-rag"; // backward compatibility
   ```

2. **Built Distribution**:
   ```
   dist/
   ├── index.js + index.d.ts
   ├── core/
   │   ├── index.js + index.d.ts
   │   └── math.js + math.d.ts
   ├── node/
   │   ├── index.js + index.d.ts
   │   └── connection.js + connection.d.ts
   ├── types/
   │   ├── index.js + index.d.ts
   │   └── interfaces.js + interfaces.d.ts
   └── ui/
       ├── index.js + index.d.ts
       ├── Button.svelte + Button.svelte.d.ts
       └── SecondButton.svelte + SecondButton.svelte.d.ts
   ```

3. **Functional Placeholder Code**:
   - Math functions that actually work: `add(2, 3)` returns `5`
   - Mock connection functions that return objects
   - Simple TypeScript interfaces (User, Config)
   - Basic Svelte button components that render and accept props

### 7. Best Practices Implementation

#### Conditional Exports

- Use conditional exports to provide different implementations for Node.js vs
  browser
- Leverage `"node"` and `"default"` conditions where appropriate

#### TypeScript Support

- Ensure all modules have proper TypeScript definitions
- Use `typesVersions` for subpath export type resolution
- Generate `.d.ts` files for all exports

#### Svelte Component Exports

- Use `"svelte"` condition for Svelte components
- Ensure components are distributed as uncompiled `.svelte` files
- Provide proper TypeScript definitions for component props

#### Tree Shaking Support

- Structure exports to support tree shaking
- Use ESM-only JavaScript as recommended by Svelte
- Avoid side effects in module initialization

### 5. Testing Strategy

- Create tests for each module independently
- Test import patterns to ensure they work correctly
- Verify tree shaking works as expected
- Test both TypeScript and JavaScript consumption

### 6. Documentation Updates

- Update README with new import patterns
- Create migration guide for existing users
- Document each module's purpose and API
- Provide examples for each import pattern

## Benefits

1. **Reduced Bundle Size**: Users can import only what they need
2. **Better Developer Experience**: Clear separation of concerns
3. **Improved Tree Shaking**: Modular structure enables better dead code
   elimination
4. **Platform-Specific Optimizations**: Separate Node.js and browser code paths
5. **Type Safety**: Dedicated types module with proper TypeScript support
6. **Component Reusability**: Dedicated UI module for Svelte components

## Migration Path for Users (Placeholder Functions)

```ts
// Before (still supported for backward compatibility)
import { add, Button, connect, Document } from "surreal-rag";

// After (recommended modular imports)
import { add } from "surreal-rag/core";
import { connect } from "surreal-rag/node";
import { Document } from "surreal-rag/types";
import { Button } from "surreal-rag/ui";
```

## Example Usage After Implementation

```ts
// Using core math functions
import { add, multiply } from "surreal-rag/core";
console.log(add(2, 3)); // 5

// Using placeholder node functions
import { connect, database } from "surreal-rag/node";
const conn = connect("localhost"); // returns placeholder connection object

...
```

This plan follows Node.js package exports best practices and SvelteKit library
packaging guidelines, ensuring compatibility with modern tooling while providing
a clean, modular API.

## Sources and References

### Node.js Package Exports Documentation

- **Node.js Official Documentation**: `/nodejs/node` - Package exports patterns,
  subpath exports, conditional exports
  - Subpath export patterns: `"./features/*.js": "./src/features/*.js"`
  - Conditional exports: `"node"`, `"import"`, `"require"`, `"default"`
    conditions
  - Export validation and security (preventing path traversal)
  - `typesVersions` field for TypeScript subpath resolution

### SvelteKit Library Packaging

- **Svelte Official Documentation**: `/context7/svelte_dev` - SvelteKit
  packaging guidelines
  - `@sveltejs/package` tool for library creation
  - Svelte-specific export conditions: `"svelte"` field
  - Distribution of uncompiled `.svelte` files
  - ESM-only JavaScript requirements
  - TypeScript definition generation and mapping

### Key Technical References

1. **Package.json Exports Field** (Node.js docs):
   - Conditional exports for different environments
   - Subpath patterns with wildcards
   - Security considerations and path validation

2. **SvelteKit Component Libraries** (Svelte docs):
   - `svelte-package` command and options
   - Proper `exports` field configuration for Svelte components
   - TypeScript support with `.d.ts` generation
   - Legacy `svelte` field for backward compatibility

3. **Best Practices Sources**:
   - Tree shaking support through proper ESM structure
   - Platform-specific optimizations using conditional exports
   - TypeScript `typesVersions` for subpath export resolution
   - Publint compatibility for package validation
