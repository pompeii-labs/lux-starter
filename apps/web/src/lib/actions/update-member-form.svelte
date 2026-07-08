<script lang="ts">
    import * as Form from "$lib/components/ui/form";
    import * as Select from "$lib/components/ui/select";
    import { getRoleValue, MEMBER_ROLES, type MemberRole, type Members } from "$lib/types/lux";
    import type { LuxAuthSession } from "@luxdb/sdk";
    import z from "zod";
    import { defaults, setError, superForm } from "sveltekit-superforms";
    import { zod4 } from "sveltekit-superforms/adapters";
    import { untrack } from "svelte";
    import { updateMember } from "./members/update";
    import { capitalize } from "$lib/utils";

    let {
        onsuccess = () => {},
        oncancel = () => {},
        member,
        selfMember,
        session,
    }: {
        onsuccess?: (member: Members) => void;
        oncancel?: () => void;
        member: Members;
        selfMember: Members;
        session: LuxAuthSession;
    } = $props();

    const updateMemberSchema = z.object({
        role: z.enum(MEMBER_ROLES),
    });

    let availableRoles = $derived(MEMBER_ROLES.slice(0, getRoleValue(selfMember.role as MemberRole) + 1).filter(r => r !== "owner"));

    const id = $props.id();

    const form = superForm(
        defaults(
            untrack(() => ({ ...member, role: member.role as MemberRole })),
            zod4(updateMemberSchema),
        ),
        {
            SPA: true,
            validators: zod4(updateMemberSchema),
            onUpdate: async ({ form }) => {
                if (form.valid) {
                    const result = await updateMember({
                        token: session.access_token,
                        update: { ...member, ...form.data },
                        fetch,
                    });

                    if (!result.success) {
                        switch (result.error.name) {
                            case "LuxError":
                                return setError(form, result.error.message);
                            case "ZodError":
                                return setError(form, result.error.message);
                            case "CustomError":
                                return setError(form, result.error.message);
                        }
                    }
                    reset({ data: form.data, newState: form.data });
                    onsuccess(result.data);
                }
            },
            id,
        },
    );

    const { form: formData, enhance, validateForm, tainted, isTainted, submitting, reset, message, errors } = form;

    validateForm({ update: true });
</script>

<form method="post" use:enhance class="flex flex-col gap-y-6">
    <Form.Field {form} name="role">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Role</Form.Label>
				<Select.Root type="single" {...props} bind:value={$formData.role}>
					<Select.Trigger class="w-full">
						{capitalize($formData.role)}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							{#each availableRoles as role}
								<Select.Item value={role}>
									{capitalize(role)}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
            {/snippet}
        </Form.Control>
        <Form.Description>Your new teammate's role</Form.Description>
        <Form.FieldErrors />
    </Form.Field>
    <div class="flex-row">
        <Form.Button disabled={$submitting || !isTainted($tainted)}>Update</Form.Button>
        <Form.Button
            type="button"
            variant="outline"
            disabled={$submitting || !isTainted($tainted)}
            onclick={() => {
                reset();
                oncancel();
            }}>Cancel</Form.Button
        >
    </div>
    {#if $message}
		<p class="mx-auto mt-2 text-center text-sm text-primary">
			{$message}
		</p>
	{/if}

	{#if $errors._errors}
		{#each $errors._errors as error, i (i)}
			<p class="mx-auto mt-2 text-center text-sm text-destructive">
				{error}
			</p>
		{/each}
	{/if}
</form>
