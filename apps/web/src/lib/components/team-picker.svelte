<script lang="ts">
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button, type ButtonProps } from "$lib/components/ui/button";
    import type { Teams } from "$lib/types/lux";
    import { resolve } from "$app/paths";
    import { ChevronsUpDownIcon, PlusIcon } from "@lucide/svelte";
    import CreateTeamForm from "../actions/create-team-form.svelte";
    import { goto } from "$app/navigation";

    let { teams, selectedTeamId, ...triggerProps }: { teams: Teams[]; selectedTeamId?: Teams['id']; } & ButtonProps = $props();

    let selectedTeam: Teams | undefined = $derived(teams.find(t => t.id === selectedTeamId));

    let createDialogOpen = $state(false);
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        {#snippet child({ props })}
            <Button {...props} variant="outline" {...triggerProps}>
                {#if selectedTeam}
                    {selectedTeam.name}
                {:else}
                    Select a team...
                {/if}
                <ChevronsUpDownIcon />
            </Button>
        {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
        {#each teams as team}
            <DropdownMenu.Item>
                {#snippet child({ props })}
                    <a
                        {...props}
                        href={resolve('/(protected)/(dashboard)/[teamSlug]', { teamSlug: team.slug })}
                    >
                        {team.name}
                    </a>
                {/snippet}
            </DropdownMenu.Item>
        {/each}
        <DropdownMenu.Item onclick={() => createDialogOpen = true}>
            <PlusIcon /> New team
        </DropdownMenu.Item>
    </DropdownMenu.Content>
</DropdownMenu.Root>

<Dialog.Root bind:open={createDialogOpen}>
    <Dialog.Content>
        <CreateTeamForm
            onsuccess={(t) => {
                goto(resolve("/(protected)/(dashboard)/[teamSlug]", { teamSlug: t.slug }));
                createDialogOpen = false;
            }}
            oncancel={() => createDialogOpen = false}
        />
    </Dialog.Content>
</Dialog.Root>
