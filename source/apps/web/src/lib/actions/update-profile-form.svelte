<script lang="ts">
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";
    import type { Profiles } from "$lib/types/lux";
    import { updateProfile } from "./profiles/update";
    import type { LuxAuthSession } from "@luxdb/sdk";
    import z from "zod";
    import { defaults, setError, superForm } from "sveltekit-superforms";
    import { zod4 } from "sveltekit-superforms/adapters";
    import { untrack } from "svelte";

    let {
        onsuccess = () => {},
        oncancel = () => {},
        profile,
        session,
    }: {
        onsuccess?: (profile: Profiles) => void;
        oncancel?: () => void;
        profile: Profiles;
        session: LuxAuthSession;
    } = $props();

    const updateProfileSchema = z.object({
        full_name: z.string().nonempty({ error: "Full Name is required" }).nullable(),
        username: z.string().nonempty({ error: "Username is required" }).nullable(),
    });

    const id = $props.id();

    const form = superForm(
        defaults(
            untrack(() => profile),
            zod4(updateProfileSchema),
        ),
        {
            SPA: true,
            validators: zod4(updateProfileSchema),
            onUpdate: async ({ form }) => {
                if (form.valid) {
                    const result = await updateProfile({
                        token: session.access_token,
                        update: form.data,
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

<form method="post" use:enhance class="space-y-6">
    <Form.Field {form} name="full_name">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Full Name</Form.Label>
                <Input required {...props} bind:value={$formData.full_name} />
            {/snippet}
        </Form.Control>
        <Form.Description>Your first and last name</Form.Description>
        <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="username">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Username</Form.Label>
                <Input required {...props} bind:value={$formData.username} />
            {/snippet}
        </Form.Control>
        <Form.Description>Your display name</Form.Description>
        <Form.FieldErrors />
    </Form.Field>
    <Form.Button disabled={$submitting || !isTainted($tainted)}>Submit</Form.Button>
    <Form.Button
        type="button"
        variant="outline"
        disabled={$submitting || !isTainted($tainted)}
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
