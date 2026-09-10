// src/routes/+layout.ts
import { createBrowserClient, createServerClient } from '@luxdb/sdk';
import type { Database } from '$lib/types/lux';
import { requirePublicEnv } from '$lib/public-env';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
    depends('lux:auth');

    const luxUrl = requirePublicEnv('PUBLIC_LUX_URL');
    const publishableKey = requirePublicEnv('PUBLIC_LUX_PUBLISHABLE_KEY');
    const lux =
        typeof window !== 'undefined' && typeof window.document !== 'undefined'
            ? createBrowserClient<Database>(luxUrl, publishableKey, {
                  fetch,
              })
            : createServerClient<Database>(luxUrl, publishableKey, {
                  fetch,
                  cookies: {
                      getAll() {
                          return data.cookies;
                      },
                  },
              });

    const { data: sessionData, error } = await lux.auth.getSession();
    const session = error ? null : sessionData?.session;

    return { lux, session };
};
