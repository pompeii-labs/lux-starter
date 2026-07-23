<script lang="ts">
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { Button } from "$lib/components/ui/button";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    import * as Dialog from "$lib/components/ui/dialog";
    import type { PageProps } from "./$types";
    import * as Table from "$lib/components/ui/table";
    import DeleteTeamForm from "$lib/actions/delete-team-form.svelte";
    import CreateInviteForm from "$lib/actions/create-invite-form.svelte";
    import MemberRow from "./member-row.svelte";
    import InviteRow from "./invite-row.svelte";

    let { data }: PageProps = $props();
    let { team, members, invites, session } = $derived(data);

    let selfMember = $derived(members.find(m => m.user_id === session.user.id)!);

    let createInviteDialogOpen = $state(false);
    let deleteTeamDialogOpen = $state(false);
</script>

<div class="p-6 space-y-6">
    <Card>
        <CardHeader>
            <CardTitle>
                Team members
            </CardTitle>
            <CardDescription>
                View and manage the members of your team
            </CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.Head>
                            Name
                        </Table.Head>
                        <Table.Head>
                            Username
                        </Table.Head>
                        <Table.Head>
                            Role
                        </Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each members as member}
                        <MemberRow {selfMember} {session} {member} />
                    {/each}
                    {#each invites as invite}
                        <InviteRow {session} {invite} />
                    {/each}
                </Table.Body>
            </Table.Root>
            <Dialog.Root bind:open={createInviteDialogOpen}>
                <Dialog.Trigger>
                    {#snippet child({ props })}
                        <Button {...props}>
                            Invite teammate
                        </Button>
                    {/snippet}
                </Dialog.Trigger>
                <Dialog.Content>
                    <CreateInviteForm {selfMember} {team} {session} oncancel={() => createInviteDialogOpen = false} onsuccess={() => createInviteDialogOpen = false} />
                </Dialog.Content>
            </Dialog.Root>
        </CardContent>
    </Card>
    <Card>
        <CardHeader>
            <CardTitle>
                Danger zone
            </CardTitle>
            <CardDescription>
                This area contains destructive actions for your team
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Dialog.Root bind:open={deleteTeamDialogOpen}>
                <Dialog.Trigger>
                    {#snippet child({ props })}
                        <Button variant="destructive" {...props}>
                            Delete team
                        </Button>
                    {/snippet}
                </Dialog.Trigger>
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>
                            Delete this team
                        </Dialog.Title>
                        <Dialog.Description>
                            Are you sure you would like to delete "{team.name}?" This action cannot be undone
                        </Dialog.Description>
                    </Dialog.Header>
                    <Dialog.Footer>
                        <DeleteTeamForm
                            {team}
                            {session}
                            onsuccess={() => goto(resolve("/(protected)/account"))}
                            oncancel={() => deleteTeamDialogOpen = false}
                        />
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Root>
        </CardContent>
    </Card>
</div>