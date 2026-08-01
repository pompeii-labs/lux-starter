<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import './layout.css';

	let { children, data } = $props();

	onMount(() => {
		const subscription = data.lux.auth.onAuthStateChange((event) => {
			if (event !== 'INITIAL_SESSION') void invalidate('lux:auth');
		});
		return () => subscription.unsubscribe();
	});
</script>

<svelte:head>
	<title>Lux Lab</title>
	<meta
		name="description"
		content="Full-stack Auth and Push validation for the Lux engine and SDKs"
	/>
</svelte:head>

{@render children()}
