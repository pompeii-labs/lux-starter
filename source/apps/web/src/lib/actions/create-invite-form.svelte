<script lang="ts">
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";
    import { getRoleValue, MEMBER_ROLES, type Invites, type MemberRole, type Members, type Teams } from "$lib/types/lux";
    import type { LuxAuthSession } from "@luxdb/sdk";
    import z from "zod";
    import { defaults, setError, superForm } from "sveltekit-superforms";
    import { zod4 } from "sveltekit-superforms/adapters";
    import { createInvite } from "./invites";
	import * as Select from "$lib/components/ui/select";
    import { capitalize } from "$lib/utils";

    let {
        onsuccess = () => {},
        oncancel = () => {},
		team,
        selfMember,
        session,
    }: {
        onsuccess?: (invite: Invites) => void;
        oncancel?: () => void;
		team: Teams;
        selfMember: Members;
        session: LuxAuthSession;
    } = $props();

    let availableRoles = $derived(MEMBER_ROLES.slice(0, getRoleValue(selfMember.role as MemberRole) + 1).filter(r => r !== "owner"));

    const createInviteSchema = z.object({
		email: z.email(),
		role: z.enum(MEMBER_ROLES),
	});

    const id = $props.id();

    const form = superForm(
        defaults(
            zod4(createInviteSchema),
        ),
        {
            SPA: true,
            validators: zod4(createInviteSchema),
            onUpdate: async ({ form }) => {
                if (form.valid) {
                    const result = await createInvite({
                        token: session.access_token,
                        insert: {
							...form.data,
							team_id: team.id
						},
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
                    onsuccess(result.data);
                }
            },
            id,
        },
    );

    const { form: formData, enhance, submitting, reset, errors, message } = form;
</script>

<form method="post" use:enhance class="space-y-6">
    <Form.Field {form} name="email">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Email</Form.Label>
                <Input type="email" required {...props} bind:value={$formData.email} />
            {/snippet}
        </Form.Control>
        <Form.Description>Your new teammate's email</Form.Description>
        <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="role">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Role</Form.Label>
				<Select.Root type="single" {...props} bind:value={$formData.role}>
					<Select.Trigger class="w-full">
						{capitalize($formData.role) ?? "Select a role..."}
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
    <Form.Button class="mb-0" disabled={$submitting}>Submit</Form.Button>
    <Form.Button
        type="button"
        variant="outline"
        disabled={$submitting}
        onclick={() => {
            reset();
            oncancel();
        }}>Cancel</Form.Button
    >

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
