<script lang="ts">
    import * as Table from "$lib/components/ui/table";
    import * as Dialog from "$lib/components/ui/dialog";
    import type { MemberWithProfile } from "$lib/actions/members";
    import { Button } from "$lib/components/ui/button";
    import { SquarePenIcon, XIcon } from "@lucide/svelte";
    import DeleteMemberForm from "$lib/actions/delete-member-form.svelte";
    import type { LuxAuthSession } from "@luxdb/sdk";
    import { getRoleValue, type MemberRole, type Members } from "$lib/types/lux";
    import UpdateMemberForm from "$lib/actions/update-member-form.svelte";

    let { member, session, selfMember }: { member: MemberWithProfile; session: LuxAuthSession; selfMember: Members } = $props();

    let isSelf = $derived(member.user_id === session.user.id);
    let canManage = $derived(getRoleValue(selfMember.role as MemberRole) >= getRoleValue(member.role as MemberRole) && selfMember.role !== "user");
    let updateMemberDialogOpen = $state(false);
    let deleteMemberDialogOpen = $state(false);
</script>

<Table.Row>
    <Table.Cell>
        {member.full_name}
        {#if isSelf}
            <span class="text-muted-foreground ml-2">you</span>
        {/if}
    </Table.Cell>
    <Table.Cell>
        {member.username}
    </Table.Cell>
    <Table.Cell>
        {member.role}
    </Table.Cell>
    <Table.Cell>
        {#if !isSelf && canManage}
            <Dialog.Root bind:open={updateMemberDialogOpen}>
                <Dialog.Trigger>
                    {#snippet child({ props })}
                        <Button variant="ghost" size="icon" {...props}>
                            <SquarePenIcon />
                        </Button>
                    {/snippet}
                </Dialog.Trigger>
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>
                            Update member
                        </Dialog.Title>
                        <Dialog.Description>
                            Modify this user's membership
                        </Dialog.Description>
                    </Dialog.Header>
                    <UpdateMemberForm {selfMember} {member} {session} onsuccess={() => updateMemberDialogOpen = false} oncancel={() => updateMemberDialogOpen = false} />
                </Dialog.Content>
            </Dialog.Root>
            <Dialog.Root bind:open={deleteMemberDialogOpen}>
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
                            Kick member
                        </Dialog.Title>
                        <Dialog.Description>
                            Are you sure you would like to remove this member from your team?
                        </Dialog.Description>
                    </Dialog.Header>
                    <Dialog.Footer>
                        <DeleteMemberForm {member} {session} onsuccess={() => deleteMemberDialogOpen = false} oncancel={() => deleteMemberDialogOpen = false} />
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Root>
        {/if}
    </Table.Cell>
</Table.Row>
