<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import GoogleIcon from '$lib/components/icons/google-icon.svelte';
	import { Button } from '$lib/components/ui/button';
	import { optionalQueryString } from '$lib/utils';
</script>

<div class="grid grid-cols-2 gap-3">
	<Button
		variant="outline"
		class="col-span-2 w-full"
		href={resolve('/(auth)/oauth/[provider]', { provider: 'google' }) +
			optionalQueryString(page.url.searchParams)}
	>
		<GoogleIcon />
		Google
	</Button>
	<!-- <Button variant="outline" class="w-full" href={resolve("/auth/[provider]", { provider: "github" })}>
		<GithubIcon />
		GitHub
	</Button> -->
</div>
