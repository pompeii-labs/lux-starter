<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Input } from '$lib/components/ui/input';
	import { resetPasswordSchema, type ResetPasswordSchema } from './schema';

	let { form: dataForm }: { form: SuperValidated<Infer<ResetPasswordSchema>> } = $props();

	const form = superForm(dataForm, {
		validators: zod4Client(resetPasswordSchema)
	});

	const { form: formData, enhance, errors, message, submitting } = form;
</script>

<form method="post" action="?/resetPassword" use:enhance class="space-y-6">
	<Form.Field {form} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Email</Form.Label>
				<Input
					required
					type="email"
					placeholder="Enter your email"
					disabled={$submitting}
					{...props}
					bind:value={$formData.email}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button type="submit" class="w-full" disabled={$submitting}>Reset password</Form.Button>
</form>

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
