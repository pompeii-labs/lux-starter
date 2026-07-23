// src/hooks.server.ts
import { PUBLIC_LUX_URL, PUBLIC_LUX_PUBLISHABLE_KEY } from '$env/static/public';
import { createServerClient } from '@luxdb/sdk';
import type { Database } from '$lib/types/lux';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.lux = createServerClient<Database>(PUBLIC_LUX_URL, PUBLIC_LUX_PUBLISHABLE_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet, headers) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
				if (Object.keys(headers).length > 0) {
					event.setHeaders(headers);
				}
			}
		}
	});

	// return resolve(event, {
	// 	filterSerializedResponseHeaders(name: string) {
	// 		return name === 'content-range' || name === 'x-supabase-api-version';
	// 	}
	// });
	return resolve(event);
};
