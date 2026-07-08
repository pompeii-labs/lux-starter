<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import type { PageProps } from './$types';
	import ResetPasswordForm from './forgot-password-form.svelte';

	let { data }: PageProps = $props();
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-md">
		<!-- Logo/Brand -->
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-2xl font-semibold text-foreground">Reset your password</h1>
			<p class="text-muted-foreground">Enter your email to receive a link to reset your password</p>
		</div>

		<Card>
			<CardContent>
				<ResetPasswordForm form={data.resetPasswordForm} />
			</CardContent>
		</Card>
	</div>
</div>
