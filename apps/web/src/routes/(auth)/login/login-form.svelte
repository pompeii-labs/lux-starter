<script lang="ts">
	import {
		FormButton,
		FormControl,
		FormField,
		FormFieldErrors,
		FormLabel
	} from '$lib/components/ui/form';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { loginSchema, type LoginSchema } from './login-schema';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Input } from '$lib/components/ui/input';

	let { form: dataForm, next }: { form: SuperValidated<Infer<LoginSchema>>; next: string } =
		$props();

	const form = superForm(dataForm, {
		validators: zod4Client(loginSchema)
	});

	const { form: formData, enhance, errors, message, submitting } = form;
</script>

<form method="post" action="?/emailLogin" use:enhance class="space-y-6">
	<FormField {form} name="email">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Email</FormLabel>
				<Input
					required
					type="email"
					placeholder="you@example.com"
					disabled={$submitting}
					{...props}
					bind:value={$formData.email}
				/>
			{/snippet}
		</FormControl>
		<FormFieldErrors />
	</FormField>
	<FormField {form} name="password">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Password</FormLabel>
				<Input
					required
					type="password"
					placeholder="Enter your password"
					disabled={$submitting}
					{...props}
					bind:value={$formData.password}
				/>
			{/snippet}
		</FormControl>
		<FormFieldErrors />
	</FormField>
	<FormField {form} name="next">
		<FormControl>
			{#snippet children({ props })}
				<Input type="hidden" {...props} value={next} />
			{/snippet}
		</FormControl>
	</FormField>
	<FormButton type="submit" class="w-full" disabled={$submitting}>Sign in</FormButton>
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
