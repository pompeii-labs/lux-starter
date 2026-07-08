<script lang="ts">
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";
    import type { Teams } from "$lib/types/lux";
    import type { LuxAuthSession } from "@luxdb/sdk";
    import z from "zod";
    import { defaults, setError, superForm } from "sveltekit-superforms";
    import { zod4 } from "sveltekit-superforms/adapters";
    import { createTeam } from "./teams/create";

    let {
        onsuccess = () => {},
        oncancel = () => {},
        session,
    }: {
        onsuccess?: (team: Teams) => void;
        oncancel?: () => void;
        session: LuxAuthSession;
    } = $props();

    const createTeamSchema = z.object({
        slug: z.string().min(4, { error: 'Team slug must be at least 4 characters' }).toLowerCase(),
        name: z.string().min(4, { error: 'Team name must be at least 4 characters' }),
    });

    const id = $props.id();

    const form = superForm(
        defaults(
            zod4(createTeamSchema),
        ),
        {
            SPA: true,
            validators: zod4(createTeamSchema),
            onUpdate: async ({ form }) => {
                if (form.valid) {
                    const result = await createTeam({
                        token: session.access_token,
                        insert: form.data,
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

    const { form: formData, enhance, message, errors, submitting, reset } = form;
</script>

<form method="post" use:enhance class="space-y-6">
    <Form.Field {form} name="name">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Team Name</Form.Label>
                <Input required {...props} bind:value={$formData.name} />
            {/snippet}
        </Form.Control>
        <Form.Description>The name for your new team</Form.Description>
        <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="slug">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Slug</Form.Label>
                <Input required {...props} bind:value={$formData.slug} />
            {/snippet}
        </Form.Control>
        <Form.Description>This will determine the URL for your team</Form.Description>
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
