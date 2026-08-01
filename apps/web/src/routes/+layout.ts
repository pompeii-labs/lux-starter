import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { createBrowserClient } from '@luxdb/sdk/browser';
import { createServerClient } from '@luxdb/sdk/ssr';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, fetch, depends }) => {
	depends('lux:auth');
	const url = env.PUBLIC_LUX_URL;
	const publishableKey = env.PUBLIC_LUX_PUBLISHABLE_KEY;
	if (!url || !publishableKey) {
		throw new Error('PUBLIC_LUX_URL and PUBLIC_LUX_PUBLISHABLE_KEY are required');
	}
	const lux = browser
		? createBrowserClient(url, publishableKey, { fetch })
		: createServerClient(url, publishableKey, {
				fetch,
				cookies: { getAll: () => data.cookies }
			});

	return { lux, session: data.initialSession };
};
