import { z } from 'zod';

export const loginSchema = z.object({
	email: z.email(),
	password: z.string(),
	next: z.string()
});

export type LoginSchema = typeof loginSchema;
