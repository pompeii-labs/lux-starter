// src/routes/+layout.ts
import { PUBLIC_LUX_URL, PUBLIC_LUX_PUBLISHABLE_KEY } from '$env/static/public';
import { createBrowserClient, createServerClient } from '@luxdb/sdk';
import type { Database } from '$lib/types/lux';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends('lux:auth');

	const lux = (typeof window !== "undefined" && typeof window.document !== "undefined")
		? createBrowserClient<Database>(PUBLIC_LUX_URL, PUBLIC_LUX_PUBLISHABLE_KEY, {
				fetch,
			})
		: createServerClient<Database>(PUBLIC_LUX_URL, PUBLIC_LUX_PUBLISHABLE_KEY, {
				fetch,
				cookies: {
					getAll() {
						return data.cookies;
					},
				},
			});

	const { data: sessionData, error } = await lux.auth.getSession();
	const session = error ? null : sessionData?.session

	return { lux, session };
};
