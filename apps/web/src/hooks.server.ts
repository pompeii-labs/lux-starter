// src/hooks.server.ts
import { createServerClient } from '@luxdb/sdk';
import { requirePublicEnv } from '$lib/public-env';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import type { Database } from '$lib/types/lux';
import type { Handle, HandleFetch } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.lux = createServerClient<Database>(
        privateEnv.LUX_URL ?? requirePublicEnv('PUBLIC_LUX_URL'),
        requirePublicEnv('PUBLIC_LUX_PUBLISHABLE_KEY'),
        {
            cookies: {
                getAll: () => event.cookies.getAll(),
                setAll: (cookiesToSet, headers) => {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        event.cookies.set(name, value, {
                            ...options,
                            path: '/',
                        });
                    });
                    if (Object.keys(headers).length > 0) {
                        event.setHeaders(headers);
                    }
                },
            },
        }
    );

    // return resolve(event, {
    // 	filterSerializedResponseHeaders(name: string) {
    // 		return name === 'content-range' || name === 'x-supabase-api-version';
    // 	}
    // });
    return resolve(event);
};

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
    const publicApiUrl = publicEnv.PUBLIC_API_URL;
    const internalApiUrl = privateEnv.API_URL;

    if (publicApiUrl && internalApiUrl && request.url.startsWith(publicApiUrl)) {
        request = new Request(request.url.replace(publicApiUrl, internalApiUrl), request);
    }

    return fetch(request);
};
