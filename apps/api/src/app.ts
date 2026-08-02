import { timingSafeEqual } from 'node:crypto';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import type { LabConfig } from './config';
import { forwardLux, luxRequest } from './lux';

const sendSchema = z.object({
	subject_id: z.string().min(1),
	notification: z.record(z.string(), z.unknown())
});

const selfSendSchema = z.object({
	notification: z.record(z.string(), z.unknown())
});

const currentUserSchema = z.object({
	user: z.object({ id: z.string().min(1) })
});

function authorized(request: Request, expected: string): boolean {
	const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
	const left = Buffer.from(supplied);
	const right = Buffer.from(expected);
	return left.length === right.length && timingSafeEqual(left, right);
}

export function createLabApp(config: LabConfig): Hono {
	const app = new Hono().basePath('/v1');
	app.use('*', cors({ origin: [], allowHeaders: ['authorization', 'content-type'] }));

	app.get('/', (c) =>
		c.json({
			name: 'lux-lab-api',
			status: 'ok',
			privilegedRoutes: 'Bearer LAB_CONTROLLER_KEY required'
		})
	);

	app.get('/health', async (c) => {
		try {
			const [root, version] = await Promise.all([
				luxRequest(config, 'v1'),
				luxRequest(config, 'v1/version')
			]);
			return c.json(
				{
					api: 'ok',
					engine: root.ok ? 'ok' : 'error',
					engineStatus: root.status,
					version: version.ok ? await version.json() : null
				},
				root.ok && version.ok ? 200 : 503
			);
		} catch (error) {
			return c.json(
				{
					api: 'ok',
					engine: 'unreachable',
					error: error instanceof Error ? error.message : 'unknown engine error'
				},
				503
			);
		}
	});

	app.post('/me/push', async (c) => {
		const accessToken = c.req.header('authorization')?.replace(/^Bearer\s+/i, '').trim();
		if (!accessToken) return c.json({ error: 'authenticated Lux session required' }, 401);

		const parsed = selfSendSchema.safeParse(await c.req.json().catch(() => null));
		if (!parsed.success) {
			return c.json({ error: 'invalid push request', issues: parsed.error.issues }, 400);
		}

		const userResponse = await luxRequest(config, 'auth/v1/user', {}, accessToken);
		if (!userResponse.ok) return forwardLux(userResponse);
		const user = currentUserSchema.safeParse(await userResponse.json());
		if (!user.success) return c.json({ error: 'Lux returned an invalid user response' }, 502);

		return forwardLux(
			await luxRequest(config, 'push/send', {
				method: 'POST',
				body: JSON.stringify({
					subject_id: user.data.user.id,
					notification: parsed.data.notification
				})
			})
		);
	});

	app.use('/push/*', async (c, next) => {
		if (!authorized(c.req.raw, config.controllerKey)) {
			return c.json({ error: 'invalid lab controller credential' }, 401);
		}
		await next();
	});

	app.get('/push/stats', async () => forwardLux(await luxRequest(config, 'push/admin/stats')));

	app.get('/push/outbox', async () =>
		forwardLux(await luxRequest(config, 'push/admin/outbox'))
	);

	app.get('/push/devices/:subjectID', async (c) => {
		const subjectID = encodeURIComponent(c.req.param('subjectID'));
		return forwardLux(await luxRequest(config, `push/devices?subject_id=${subjectID}`));
	});

	app.post('/push/send', async (c) => {
		const parsed = sendSchema.safeParse(await c.req.json().catch(() => null));
		if (!parsed.success) {
			return c.json({ error: 'invalid push request', issues: parsed.error.issues }, 400);
		}
		return forwardLux(
			await luxRequest(config, 'push/send', {
				method: 'POST',
				body: JSON.stringify(parsed.data)
			})
		);
	});

	return app;
}
