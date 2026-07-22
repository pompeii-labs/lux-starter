import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { fail, setError, setMessage, superValidate } from 'sveltekit-superforms';
import { signupSchema } from './signup-schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { AuthRoutes } from '$lib/routes';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export const load: PageServerLoad = async (event) => {
	const { data, error } = await event.locals.lux.auth.getSession();

	const next = event.url.searchParams.get('next') ?? resolve(AuthRoutes.postLogin);

	if (!error && data?.session) {
		redirect(303, next);
	}

	return {
		emailForm: await superValidate(zod4(signupSchema))
	};
};

export const actions: Actions = {
	emailSignup: async (event) => {
		const form = await superValidate(event, zod4(signupSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { data: signUpData, error: signUpError } = await event.locals.lux.auth.signUp({
			email: form.data.email,
			password: form.data.password,
		});

		if (signUpError) {
			console.error(signUpError);
			return setError(form, signUpError.message);
		}

		if (!signUpData?.user) {
			console.error('Could not sign up');
			return setError(form, 'Could not sign up');
		}

		const { error: userCreateError } = await event.locals.lux.table('profiles').insert({
			id: signUpData.user.id,
		});

		if (userCreateError) {
			console.error('Could not create user');
			console.error(userCreateError.details);
			return setError(form, userCreateError.message);
		}
	}
};
