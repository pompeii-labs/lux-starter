import { error, redirect } from '@sveltejs/kit';
import { optionalQueryString } from '$lib/utils';
import type { PageServerLoad } from './$types';
import type { LuxAuthProvider } from '@luxdb/sdk/auth';

export const load: PageServerLoad = async (event) => {
	const {
		locals: { lux }
	} = event;

	const { data, error: sbError } = await lux.auth.signInWithOAuth({
		provider: event.params.provider as LuxAuthProvider['provider'],
		redirectTo: event.url.origin + '/callback' + optionalQueryString(event.url.searchParams)
	});

	if (sbError) {
		error(500, {
			message: sbError.message
		});
	}

	redirect(303, data!.url);
};
