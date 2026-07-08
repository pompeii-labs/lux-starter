<script lang="ts">
    import * as Form from "$lib/components/ui/form";
    import type { Members } from "$lib/types/lux";
    import type { LuxAuthSession } from "@luxdb/sdk";
    import z from "zod";
    import { defaults, setError, superForm } from "sveltekit-superforms";
    import { zod4 } from "sveltekit-superforms/adapters";
    import { deleteInvite } from "./invites";
    import { deleteMember } from "./members";

    let {
        onsuccess = () => {},
        oncancel = () => {},
		member,
        session,
    }: {
        onsuccess?: (member: Members) => void;
        oncancel?: () => void;
		member: Members;
        session: LuxAuthSession;
    } = $props();

    const deleteInviteSchema = z.object({});

    const id = $props.id();

    const form = superForm(
        defaults(
            zod4(deleteInviteSchema),
        ),
        {
            SPA: true,
            validators: zod4(deleteInviteSchema),
            onUpdate: async ({ form }) => {
                if (form.valid) {
                    const result = await deleteMember({
                        token: session.access_token,
                        member,
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

    const { enhance, submitting, reset, errors, message } = form;
</script>

<form method="post" use:enhance class="space-y-6">
    <Form.Button variant="destructive" class="mb-0" disabled={$submitting}>Kick</Form.Button>
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
