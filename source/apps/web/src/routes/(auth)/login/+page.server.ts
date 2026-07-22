import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { loginSchema } from './login-schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { AuthRoutes } from '$lib/routes';
import { resolve } from '$app/paths';

export const load: PageServerLoad = async (event) => {
	const { data, error } = await event.locals.lux.auth.getSession();

	const next = event.url.searchParams.get('next') ?? resolve(AuthRoutes.postLogin);

	if (!error && data?.session) {
		redirect(303, next);
	}

	return {
		emailForm: await superValidate(zod4(loginSchema))
	};
};

export const actions: Actions = {
	emailLogin: async (event) => {
		const form = await superValidate(event, zod4(loginSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { error } = await event.locals.lux.auth.signInWithPassword({
			email: form.data.email,
			password: form.data.password
		});
		if (error) {
			return setError(form, error.message);
		} else {
			redirect(303, form.data.next ?? '/');
		}
	}
};
