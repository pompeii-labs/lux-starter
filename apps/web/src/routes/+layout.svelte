<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';

	let { children, data } = $props();
	let { lux, session } = $derived(data);

	onMount(() => {
		const { unsubscribe } = lux.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('lux:auth');
			}
		});

		return () => unsubscribe();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-w-dvw max-w-dvw min-h-dvh max-h-dvh flex flex-col overflow-hidden">
	{@render children()}
</div>
