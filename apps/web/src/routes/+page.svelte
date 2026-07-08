<script lang="ts">
    import type { PageProps } from "./$types";
    import { Button } from "$lib/components/ui/button";
    import { resolve } from "$app/paths";
    import * as NavigationMenu from "$lib/components/ui/navigation-menu";
    import { IsMobile } from "$lib/hooks/is-mobile.svelte";
    import { navigationMenuTriggerStyle } from "$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "$lib/utils";
    import { LogOutIcon } from "@lucide/svelte";

    let { data }: PageProps = $props();
	let { lux, session } = $derived(data);

    const isMobile = new IsMobile();

    type ListItemProps = HTMLAttributes<HTMLAnchorElement> & {
        title: string;
        href: string;
        content: string;
    };
</script>

<div class="px-6 py-3">
	<NavigationMenu.Root viewport={isMobile.current}>
		<NavigationMenu.List class="flex-wrap">
			<NavigationMenu.Item>
				<NavigationMenu.Link>
					{#snippet child()}
						<a href="/" class={navigationMenuTriggerStyle()}>Product Name</a>
					{/snippet}
				</NavigationMenu.Link>
			</NavigationMenu.Item>
		</NavigationMenu.List>
	</NavigationMenu.Root>
</div>

<div class="flex flex-col items-center flex-1 container mt-32 mx-auto">
	<div class="flex flex-col items-center">
		<h1 class="text-5xl">This is a dashboard template</h1>
		<p class="mt-4">This template comes with auth, a database, realtime, and basic team management</p>
		<div class="mt-8">
			{#if session}
				<Button onclick={() => lux.auth.signOut()}>
					<LogOutIcon /> Sign Out
				</Button>
			{:else}
				<Button href={resolve("/(auth)/signup")}>Get Started</Button>
				<Button variant="outline" href={resolve("/(auth)/login")}>Login</Button>
			{/if}
		</div>
	</div>
</div>
