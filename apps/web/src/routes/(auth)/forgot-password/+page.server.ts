import type { Actions, PageServerLoad } from './$types';
import { fail, setError, setMessage, superValidate } from 'sveltekit-superforms';
import { resetPasswordSchema } from './schema';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async () => {
	return {
		resetPasswordForm: await superValidate(zod4(resetPasswordSchema))
	};
};

export const actions: Actions = {
	resetPassword: async (event) => {
		const form = await superValidate(event, zod4(resetPasswordSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		// const { error } = await event.locals.lux.auth.resetPasswordForEmail(form.data.email);
		// if (error) {
		// 	return setError(form, error.message);
		// } else {
		// 	return setMessage(form, 'Check your email for a link to reset your password');
		// }
	}
};
