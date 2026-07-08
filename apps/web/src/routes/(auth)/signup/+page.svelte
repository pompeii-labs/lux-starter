<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { AuthRoutes } from '$lib/routes';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { optionalQueryString } from '$lib/utils';
	import type { PageProps } from './$types';
	import SignupForm from './signup-form.svelte';

	let { data }: PageProps = $props();
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-md">
		<!-- Logo/Brand -->
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-2xl font-semibold text-foreground">Welcome</h1>
			<p class="text-muted-foreground">Create an account to continue</p>
		</div>

		<Card>
			<CardContent>
				<SignupForm
					form={data.emailForm}
					next={page.url.searchParams.get('next') ?? resolve(AuthRoutes.postSignup)}
				/>
			</CardContent>
		</Card>

		<p class="mt-6 text-center text-sm text-muted-foreground">
			Already have an account?
			<Button
				variant="link"
				href={resolve(AuthRoutes.login) + optionalQueryString(page.url.searchParams)}
			>
				Log in
			</Button>
		</p>
	</div>
</div>
