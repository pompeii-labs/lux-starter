<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let email = $state('');
	let password = $state('');
	let busy = $state(false);
	let message = $state<string | null>(null);
	let failed = $state(false);
	let engine = $state<'checking' | 'ok' | 'error'>('checking');
	let engineVersion = $state('unknown');
	let events = $state<Array<{ time: string; name: string }>>([]);

	const session = $derived(data.session);
	const user = $derived(session?.user ?? null);

	function record(name: string) {
		events = [{ time: new Date().toLocaleTimeString(), name }, ...events].slice(0, 40);
	}

	async function perform(operation: () => Promise<{ error?: { message: string } | null }>, success: string) {
		busy = true;
		failed = false;
		message = null;
		try {
			const result = await operation();
			if (result.error) throw new Error(result.error.message);
			message = success;
			record(success);
		} catch (error) {
			failed = true;
			message = error instanceof Error ? error.message : 'Unknown Lux error';
			record(`ERROR · ${message}`);
		} finally {
			busy = false;
		}
	}

	async function oauth(provider: 'apple' | 'google' | 'github') {
		const redirectTo = `${window.location.origin}/auth/callback`;
		await perform(
			() => data.lux.auth.signInWithOAuth({ provider, redirectTo, flow: 'code' }),
			`Started ${provider} OAuth`
		);
	}

	onMount(() => {
		const subscription = data.lux.auth.onAuthStateChange((event) => record(event));
		void fetch(`${env.PUBLIC_API_URL}/v1/health`)
			.then(async (response) => {
				const body = await response.json();
				engine = response.ok ? 'ok' : 'error';
				engineVersion = body.version?.version ?? body.version?.engine_version ?? 'available';
			})
			.catch(() => { engine = 'error'; });
		return () => subscription.unsubscribe();
	});
</script>

<main class="shell">
	<div class="topbar">
		<div class="brand">
			<div class="mark">L</div>
			<div><h1>Lux Lab</h1><p>Browser Auth + full-stack validation</p></div>
		</div>
		<div class="status">
			<span class:ok={engine === 'ok'} class="dot"></span>
			{engine === 'checking' ? 'checking engine' : `engine ${engine}`}
		</div>
	</div>

	<div class="grid">
		<div class="stack">
			<section class="card">
				<header><span class="eyebrow">Environment</span><h2>Active Lux project</h2><p>The browser carries only a publishable key and the signed-in user's session.</p></header>
				<div class="metrics">
					<div class="metric"><span>Engine</span><strong>{engineVersion}</strong></div>
					<div class="metric"><span>Session</span><strong>{session ? 'Authenticated' : 'Signed out'}</strong></div>
					<div class="metric"><span>User</span><strong>{user?.email ?? user?.id?.slice(0, 12) ?? 'None'}</strong></div>
				</div>
			</section>

			<section class="card">
				<header><span class="eyebrow">Authentication</span><h2>{session ? 'Session controls' : 'Exercise every browser flow'}</h2><p>Email, anonymous, and OAuth operations use the same public SDK surface an application ships.</p></header>
				<div class="content form">
					{#if session}
						<div class="notice">Signed in as <strong>{user?.email ?? user?.id}</strong>. Access and refresh tokens are intentionally never rendered.</div>
						<div class="actions">
							<button class="button" disabled={busy} onclick={() => perform(() => data.lux.auth.refreshSession(session!.refresh_token), 'Session refreshed')}>Refresh session</button>
							<button class="button danger" disabled={busy} onclick={() => perform(() => data.lux.auth.signOut(), 'Signed out')}>Sign out</button>
						</div>
					{:else}
						<div class="field"><label for="email">Email</label><input id="email" bind:value={email} type="email" autocomplete="email" placeholder="lab@example.com" /></div>
						<div class="field"><label for="password">Password</label><input id="password" bind:value={password} type="password" autocomplete="current-password" placeholder="At least eight characters" /></div>
						<div class="actions">
							<button class="button primary" disabled={busy} onclick={() => perform(() => data.lux.auth.signInWithPassword({ email, password }), 'Password sign-in succeeded')}>Sign in</button>
							<button class="button" disabled={busy} onclick={() => perform(() => data.lux.auth.signUp({ email, password }), 'Sign-up succeeded')}>Create user</button>
							<button class="button" disabled={busy} onclick={() => perform(() => data.lux.auth.signInAnonymously(), 'Anonymous sign-in succeeded')}>Anonymous</button>
						</div>
						<div class="actions">
							<button class="button provider" disabled={busy} onclick={() => oauth('apple')}>Apple</button>
							<button class="button provider" disabled={busy} onclick={() => oauth('google')}>Google</button>
							<button class="button provider" disabled={busy} onclick={() => oauth('github')}>GitHub</button>
						</div>
					{/if}
					{#if message}<div class:error={failed} class="notice">{message}</div>{/if}
				</div>
			</section>
		</div>

		<section class="card">
			<header><span class="eyebrow">Diagnostics</span><h2>Auth event timeline</h2><p>Lifecycle names only. Credentials and token values are never logged.</p></header>
			<div class="content event-list">
				{#if events.length === 0}<div class="empty">Waiting for the SDK's initial-session event…</div>{/if}
				{#each events as event}<div class="event"><time>{event.time}</time><span>{event.name}</span></div>{/each}
			</div>
		</section>
	</div>
</main>
