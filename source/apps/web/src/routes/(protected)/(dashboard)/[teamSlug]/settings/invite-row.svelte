<script lang="ts">
    import * as Table from "$lib/components/ui/table";
    import * as Dialog from "$lib/components/ui/dialog";
    import type { Invites } from "$lib/types/lux";
    import { Button } from "$lib/components/ui/button";
    import { XIcon } from "@lucide/svelte";
    import DeleteInviteForm from "$lib/actions/delete-invite-form.svelte";
    import type { LuxAuthSession } from "@luxdb/sdk";

    let { invite, session }: { invite: Invites; session: LuxAuthSession } = $props();

    let deleteInviteDialogOpen = $state(false);
</script>

<Table.Row>
    <Table.Cell>
        {invite.email}
        <span class="text-muted-foreground italic">
            invited
        </span>
    </Table.Cell>
    <Table.Cell></Table.Cell>
    <Table.Cell>
        {invite.role}
    </Table.Cell>
    <Table.Cell>
        <Dialog.Root bind:open={deleteInviteDialogOpen}>
            <Dialog.Trigger>
                {#snippet child({ props })}
                    <Button variant="ghost" size="icon" {...props}>
                        <XIcon />
                    </Button>
                {/snippet}
            </Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>
                        Revoke invite
                    </Dialog.Title>
                    <Dialog.Description>
                        You can always invite them back later
                    </Dialog.Description>
                </Dialog.Header>
                <Dialog.Footer>
                    <DeleteInviteForm {invite} {session} onsuccess={() => deleteInviteDialogOpen = false} oncancel={() => deleteInviteDialogOpen = false} />
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>
    </Table.Cell>
</Table.Row>
