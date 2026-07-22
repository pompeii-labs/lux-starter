<script lang="ts">
    import { invalidate } from "$app/navigation";
    import type { Teams } from "$lib/types/lux";
    import type { LuxProjectLiveSubscription } from "@luxdb/sdk";
    import { onMount } from "svelte";
    import type { LayoutProps } from "./$types";

    let { data, children }: LayoutProps = $props();
    let { lux } = $derived(data);

    let teamSub: LuxProjectLiveSubscription<Teams> | null = $state(null);

    onMount(() => {
        async function subscribe() {
            const { live: sub, error: luxError } = await lux
                .table('teams')
                .select()
                .live();

            if (luxError) {
                return console.error(luxError);
            }

            teamSub = sub;
            teamSub?.on('change', () => {
                console.log('lux:teams invalidated by realtime');
                invalidate("lux:teams");
            });
        }

        subscribe();

        return () => {
            teamSub?.unsubscribe();
            teamSub = null;
        }
    })
</script>

{@render children()}
