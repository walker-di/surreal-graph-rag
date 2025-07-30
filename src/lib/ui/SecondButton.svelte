<script lang="ts">
	/**
	 * Second button component for the surreal-rag library
	 * This is another placeholder component to demonstrate multiple component exports
	 */

	// Component props
	export let label: string = 'Second Button';
	export let icon: string = '';
	export let loading: boolean = false;
	export let outline: boolean = false;

	// Event dispatcher
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher<{
		click: MouseEvent;
		focus: FocusEvent;
		blur: FocusEvent;
	}>();

	// Handle events
	function handleClick(event: MouseEvent) {
		if (!loading) {
			dispatch('click', event);
		}
	}

	function handleFocus(event: FocusEvent) {
		dispatch('focus', event);
	}

	function handleBlur(event: FocusEvent) {
		dispatch('blur', event);
	}

	// Compute CSS classes
	$: classes = [
		'second-btn',
		outline ? 'second-btn-outline' : 'second-btn-filled',
		loading ? 'second-btn-loading' : ''
	].filter(Boolean).join(' ');
</script>

<button
	class={classes}
	disabled={loading}
	on:click={handleClick}
	on:focus={handleFocus}
	on:blur={handleBlur}
	type="button"
>
	{#if loading}
		<span class="spinner"></span>
	{:else if icon}
		<span class="icon">{icon}</span>
	{/if}
	<span class="label">{label}</span>
</button>

<style>
	.second-btn {
		padding: 0.625rem 1.25rem;
		border: 2px solid #8b5cf6;
		border-radius: 0.5rem;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.3s ease;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		position: relative;
		overflow: hidden;
	}

	.second-btn-filled {
		background-color: #8b5cf6;
		color: white;
	}

	.second-btn-filled:hover:not(:disabled) {
		background-color: #7c3aed;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
	}

	.second-btn-outline {
		background-color: transparent;
		color: #8b5cf6;
	}

	.second-btn-outline:hover:not(:disabled) {
		background-color: #8b5cf6;
		color: white;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
	}

	.second-btn-loading {
		cursor: not-allowed;
		opacity: 0.7;
	}

	.icon {
		font-size: 1rem;
	}

	.label {
		white-space: nowrap;
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid transparent;
		border-top: 2px solid currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.second-btn:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
	}

	.second-btn:active:not(:disabled) {
		transform: translateY(0);
	}
</style>
