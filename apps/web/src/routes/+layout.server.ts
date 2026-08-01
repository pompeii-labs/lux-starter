import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
	const { data, error } = await locals.lux.auth.getSession();
	return {
		cookies: cookies.getAll(),
		initialSession: error ? null : data?.session ?? null
	};
};
