<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { AuthRoutes } from '$lib/routes';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { optionalQueryString } from '$lib/utils';
	import OauthSignIn from '../oauth-sign-in.svelte';
	import type { PageProps } from './$types';
	import LoginForm from './login-form.svelte';

	let { data }: PageProps = $props();
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-md">
		<!-- Logo/Brand -->
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-2xl font-semibold text-foreground">Welcome back</h1>
			<p class="text-muted-foreground">Sign in to your account to continue</p>
		</div>

		<Card>
			<CardContent>
				<LoginForm
					form={data.emailForm}
					next={page.url.searchParams.get('next') ?? resolve(AuthRoutes.postLogin)}
				/>
				<div class="my-6 flex items-center gap-2 text-muted-foreground">
					<Separator class="shrink" />
					<p class="text-sm text-nowrap">Or continue with</p>
					<Separator class="shrink" />
				</div>
				<OauthSignIn />
			</CardContent>
		</Card>

		<p class="mt-6 text-center text-sm text-muted-foreground">
			Don't have an account?
			<Button
				variant="link"
				href={resolve(AuthRoutes.signup) + optionalQueryString(page.url.searchParams)}
			>
				Sign up for free
			</Button>
		</p>
	</div>
</div>
