<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { resolve } from '$app/paths';
    import AcceptInviteForm from '$lib/actions/accept-invite-form.svelte';
    import UpdateProfileForm from '$lib/actions/update-profile-form.svelte';
	import * as Card from '$lib/components/ui/card';
    import type { PageProps } from './$types';
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from '$lib/components/ui/button';
    import { ArrowRightIcon, LogOutIcon, PlusIcon } from '@lucide/svelte';
    import CreateTeamForm from '$lib/actions/create-team-form.svelte';
    import type { LuxProjectLiveSubscription } from '@luxdb/sdk';
    import type { Invites } from '$lib/types/lux';
    import { onMount } from 'svelte';

    let { data }: PageProps = $props();
    let { lux, profile, invites, teams, session } = $derived(data);

    let inviteSub: LuxProjectLiveSubscription<Invites> | null = $state(null);

    onMount(() => {
        async function subscribe() {
            const { live: sub, error: luxError } = await lux
                .table('invites')
                .select()
                .live();

            if (luxError) {
                return console.error(luxError);
            }

            inviteSub = sub;
            inviteSub?.on('change', () => {
                console.log('lux:invites invalidated by realtime');
                invalidate("lux:invites");
            });
        }

        subscribe();

        return () => {
            inviteSub?.unsubscribe();
            inviteSub = null;
        }
    })
</script>

<div class="flex flex-col min-h-screen mx-auto container px-4 gap-8">
    <div class="w-full">
        <nav class="flex gap-0 justify-between py-1">
            <Button variant="ghost" href={resolve("/")}>
                Product Name
            </Button>
            <Button variant="outline" onclick={() => lux.auth.signOut()}>
                <LogOutIcon /> Sign Out
            </Button>
        </nav>
    </div>
    <div class="grid grid-cols-4 gap-8">
        {#each teams as team}
            <Card.Root class="w-full h-full">
                <Card.Header>
                    <Card.Title>{team.name}</Card.Title>
                    <Card.Description>/{team.slug}</Card.Description>
                </Card.Header>
                <Card.Footer>
                    <Button variant="outline" href={resolve("/(protected)/(dashboard)/[teamSlug]", { teamSlug: team.slug })}>
                        Open <ArrowRightIcon />
                    </Button>
                </Card.Footer>
            </Card.Root>
        {/each}
        <Dialog.Root>
            <Dialog.Trigger>
                {#snippet child({ props })}
                    <Button variant="outline" class="w-full h-full" {...props}>
                        <PlusIcon /> New team
                    </Button>
                {/snippet}
            </Dialog.Trigger>
            <Dialog.Content>
                <CreateTeamForm {session} />
            </Dialog.Content>
        </Dialog.Root>
    </div>
    <Card.Root>
        <Card.Content>
            <UpdateProfileForm {profile} {session} />
        </Card.Content>
    </Card.Root>

    {#each invites as invite}
        <div class="space-y-4">
            <p>You have been invited to {JSON.stringify(invite)}</p>
            <AcceptInviteForm
                {invite}
                {session}
                onsuccess={team => {
                    goto(resolve("/(protected)/(dashboard)/[teamSlug]", { teamSlug: team.slug }));
                }}
            />
        </div>
    {/each}
</div>
