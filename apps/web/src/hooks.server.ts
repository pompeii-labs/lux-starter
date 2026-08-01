import { env } from '$env/dynamic/public';
import { createServerClient } from '@luxdb/sdk/ssr';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (!env.PUBLIC_LUX_URL || !env.PUBLIC_LUX_PUBLISHABLE_KEY) {
		throw new Error('PUBLIC_LUX_URL and PUBLIC_LUX_PUBLISHABLE_KEY are required');
	}

	event.locals.lux = createServerClient(env.PUBLIC_LUX_URL, env.PUBLIC_LUX_PUBLISHABLE_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookies, headers) => {
				for (const cookie of cookies) {
					event.cookies.set(cookie.name, cookie.value, { ...cookie.options, path: '/' });
				}
				if (Object.keys(headers).length > 0) event.setHeaders(headers);
			}
		}
	});

	return resolve(event);
};
