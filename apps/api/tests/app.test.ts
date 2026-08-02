import { describe, expect, test } from 'bun:test';
import { createLabApp } from '../src/app';
import type { LabConfig } from '../src/config';

function fixture(fetch: LabConfig['fetch']): LabConfig {
	return {
		luxURL: 'http://engine.test',
		luxSecretKey: 'lux_sec_test',
		controllerKey: 'controller-test',
		port: 15892,
		fetch
	};
}

describe('Lux Lab API', () => {
	test('health reports the engine version without exposing credentials', async () => {
		const seen: Request[] = [];
		const app = createLabApp(
			fixture(async (input, init) => {
				seen.push(input instanceof Request ? input : new Request(input.toString(), init));
				return Response.json({ version: '0.37.0' });
			})
		);
		const response = await app.request('/v1/health');
		const body = (await response.json()) as { engine: string };
		expect(response.status).toBe(200);
		expect(body.engine).toBe('ok');
		expect(JSON.stringify(body)).not.toContain('lux_sec_test');
		expect(seen).toHaveLength(2);
		expect(seen[0]?.headers.get('authorization')).toBe('Bearer lux_sec_test');
	});

	test('push administration rejects an absent controller credential', async () => {
		const app = createLabApp(fixture(async () => Response.json({})));
		const response = await app.request('/v1/push/stats');
		expect(response.status).toBe(401);
	});

	test('push send forwards only a validated subject and notification', async () => {
		let forwarded: Request | undefined;
		const app = createLabApp(
			fixture(async (input, init) => {
				forwarded = input instanceof Request ? input : new Request(input.toString(), init);
				return Response.json({ enqueued: 1 });
			})
		);
		const response = await app.request('/v1/push/send', {
			method: 'POST',
			headers: {
				authorization: 'Bearer controller-test',
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				subject_id: 'user-1',
				notification: { title: 'Lux Lab', body: 'Push works' }
			})
		});
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ enqueued: 1 });
		expect(forwarded?.url).toBe('http://engine.test/push/send');
		expect(await forwarded?.json()).toEqual({
			subject_id: 'user-1',
			notification: { title: 'Lux Lab', body: 'Push works' }
		});
	});

	test('self push derives its subject from the authenticated Lux session', async () => {
		const forwarded: Request[] = [];
		const app = createLabApp(
			fixture(async (input, init) => {
				const request = input instanceof Request ? input : new Request(input.toString(), init);
				forwarded.push(request);
				if (request.url.endsWith('/auth/v1/user')) {
					return Response.json({ user: { id: 'verified-user' } });
				}
				return Response.json({ enqueued: 1 });
			})
		);
		const response = await app.request('/v1/me/push', {
			method: 'POST',
			headers: {
				authorization: 'Bearer user-access-token',
				'content-type': 'application/json'
			},
			body: JSON.stringify({ notification: { title: 'Lux Lab', body: 'Push works' } })
		});

		expect(response.status).toBe(200);
		expect(forwarded).toHaveLength(2);
		expect(forwarded[0]?.headers.get('authorization')).toBe('Bearer user-access-token');
		expect(forwarded[1]?.headers.get('authorization')).toBe('Bearer lux_sec_test');
		expect(await forwarded[1]?.json()).toEqual({
			subject_id: 'verified-user',
			notification: { title: 'Lux Lab', body: 'Push works' }
		});
	});
});
