<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let message = $state('Exchanging the one-time authorization code…');
	let failed = $state(false);

	onMount(() => {
		void data.lux.auth.consumeOAuthRedirect(window.location.href).then((result) => {
			if (result.error) {
				failed = true;
				message = result.error.message;
				return;
			}
			void goto('/', { replaceState: true, invalidateAll: true });
		});
	});
</script>

<main class="shell">
	<section class="card" style="max-width: 620px; margin: 15vh auto 0;">
		<header><span class="eyebrow">OAuth callback</span><h2>{failed ? 'Sign-in failed' : 'Completing sign-in'}</h2></header>
		<div class="content"><div class:error={failed} class="notice">{message}</div></div>
	</section>
</main>
