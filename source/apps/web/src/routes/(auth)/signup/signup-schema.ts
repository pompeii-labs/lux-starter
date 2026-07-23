import { z } from 'zod';

export const signupSchema = z.object({
	email: z.email(),
	password: z
		.string()
		.min(8, { error: 'Must be at least 8 characters', abort: true })
		.max(32)
		.regex(/[a-z]/, { error: 'Must contain at least one lowercase character', abort: true })
		.regex(/[A-Z]/, { error: 'Must contain at least one uppercase character', abort: true })
		.regex(/\d/, { error: 'Must contain at least one number', abort: true })
		.regex(/[!@#$%^&*()_+\-=[\]{};'\\:"|<>?,.\\/`~]/, {
			error: 'Must contain at least one symbol',
			abort: true
		}),
	next: z.string()
});

export type SignupSchema = typeof signupSchema;
