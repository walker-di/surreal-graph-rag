<script lang="ts">
	import { cn } from "$lib/utils.js";

	interface Props {
		value?: number;
		max?: number;
		class?: string;
	}

	let { value = 0, max = 100, class: className = "" }: Props = $props();

	const percentage = Math.max(0, Math.min(100, (value / max) * 100));
</script>

<div
	class={cn(
		"relative h-2 w-full overflow-hidden rounded-full bg-secondary",
		className
	)}
>
	<div
		class="h-full w-full flex-1 bg-primary transition-all"
		style="transform: translateX(-{100 - percentage}%)"
	></div>
</div>
