<script lang="ts">
	/**
	 * Test file to validate Svelte component exports work correctly
	 */

	// Test component imports
	import { Button, SecondButton } from "./lib/ui/index.js";
	import type { User } from "./lib/types/index.js";
	import { add } from "./lib/core/index.js";

	// Test data
	let count = 0;
	let loading = false;

	const user: User = {
		id: "test-123",
		name: "Test User"
	};

	// Event handlers
	function handleButtonClick() {
		count = add(count, 1);
		console.log("Button clicked! Count:", count);
	}

	function handleSecondButtonClick() {
		loading = true;
		setTimeout(() => {
			loading = false;
			count = add(count, 5);
		}, 2000);
	}
</script>

<div class="test-container">
	<h1>Component Export Test</h1>
	
	<div class="test-section">
		<h2>Button Component Test</h2>
		<p>Count: {count}</p>
		
		<Button 
			text="Add 1" 
			variant="primary" 
			on:click={handleButtonClick}
		/>
		
		<Button 
			text="Secondary Button" 
			variant="secondary" 
			size="large"
			on:click={handleButtonClick}
		/>
	</div>

	<div class="test-section">
		<h2>SecondButton Component Test</h2>
		
		<SecondButton 
			label="Add 5 (with delay)" 
			icon="⚡"
			{loading}
			on:click={handleSecondButtonClick}
		/>
		
		<SecondButton 
			label="Outline Button" 
			outline={true}
			on:click={handleButtonClick}
		/>
	</div>

	<div class="test-section">
		<h2>Type Test</h2>
		<p>User: {user.name} (ID: {user.id})</p>
	</div>
</div>

<style>
	.test-container {
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
		font-family: system-ui, sans-serif;
	}

	.test-section {
		margin-bottom: 2rem;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
	}

	.test-section h2 {
		margin-top: 0;
		color: #374151;
	}

	.test-section :global(button) {
		margin-right: 1rem;
		margin-bottom: 0.5rem;
	}
</style>
