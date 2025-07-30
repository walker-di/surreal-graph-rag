<script lang="ts">
	/**
	 * Simple button component for the surreal-rag library
	 * This is a placeholder component to demonstrate Svelte component exports
	 */

	// Component props
	export let text: string = 'Click me';
	export let variant: 'primary' | 'secondary' | 'danger' = 'primary';
	export let disabled: boolean = false;
	export let size: 'small' | 'medium' | 'large' = 'medium';

	// Event dispatcher
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher<{
		click: MouseEvent;
	}>();

	// Handle click events
	function handleClick(event: MouseEvent) {
		if (!disabled) {
			dispatch('click', event);
		}
	}

	// Compute CSS classes based on props
	$: classes = [
		'btn',
		`btn-${variant}`,
		`btn-${size}`,
		disabled ? 'btn-disabled' : ''
	].filter(Boolean).join(' ');
</script>

<button
	class={classes}
	{disabled}
	on:click={handleClick}
	type="button"
>
	{text}
</button>

<style>
	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-family: inherit;
		font-size: 1rem;
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.btn-primary {
		background-color: #3b82f6;
		color: white;
	}

	.btn-primary:hover:not(.btn-disabled) {
		background-color: #2563eb;
	}

	.btn-secondary {
		background-color: #6b7280;
		color: white;
	}

	.btn-secondary:hover:not(.btn-disabled) {
		background-color: #4b5563;
	}

	.btn-danger {
		background-color: #ef4444;
		color: white;
	}

	.btn-danger:hover:not(.btn-disabled) {
		background-color: #dc2626;
	}

	.btn-small {
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
	}

	.btn-medium {
		padding: 0.5rem 1rem;
		font-size: 1rem;
	}

	.btn-large {
		padding: 0.75rem 1.5rem;
		font-size: 1.125rem;
	}

	.btn-disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
