type Session = {
	access_token: string;
	refresh_token: string;
	user: { id: string };
};

import { createLabApp } from '../apps/api/src/app';

function parse(source: string): Map<string, string> {
	const values = new Map<string, string>();
	for (const raw of source.split(/\r?\n/)) {
		const line = raw.trim();
		const separator = line.indexOf('=');
		if (!line || line.startsWith('#') || separator < 1) continue;
		values.set(line.slice(0, separator), line.slice(separator + 1));
	}
	return values;
}

const env = parse(await Bun.file('.env.local').text());
const baseURL = env.get('LUX_URL')?.replace(/\/+$/, '');
const publishableKey = env.get('LUX_PUBLISHABLE_KEY');
const secretKey = env.get('LUX_SECRET_KEY');
if (!baseURL || !publishableKey || !secretKey) {
	throw new Error('Local profile is incomplete; run lux start first');
}

async function request(
	path: string,
	options: RequestInit & { key?: 'publishable' | 'secret'; bearer?: string } = {}
): Promise<Response> {
	const headers = new Headers(options.headers);
	const key = options.key === 'secret' ? secretKey : publishableKey;
	headers.set('apikey', key);
	if (options.bearer) headers.set('authorization', `Bearer ${options.bearer}`);
	else if (options.key === 'secret') headers.set('authorization', `Bearer ${secretKey}`);
	if (options.body) headers.set('content-type', 'application/json');
	return fetch(`${baseURL}/${path.replace(/^\/+/, '')}`, { ...options, headers });
}

async function expectStatus(label: string, response: Response, status: number): Promise<void> {
	if (response.status !== status) {
		throw new Error(`${label}: expected HTTP ${status}, received ${response.status}`);
	}
	console.log(`✓ ${label}`);
}

const email = `smoke-${Date.now()}@lux-lab.invalid`;
const password = `Lux-lab-${crypto.randomUUID()}`;
const fakeDeviceToken = crypto.randomUUID().replaceAll('-', '').repeat(2);
let userID: string | undefined;

try {
	const versionResponse = await request('v1/version', { key: 'secret' });
	await expectStatus('candidate engine responds', versionResponse, 200);
	const version = (await versionResponse.json()) as { version?: string };
	if (version.version !== '0.37.0') throw new Error(`expected engine 0.37.0, received ${version.version ?? 'unknown'}`);

	const controllerKey = crypto.randomUUID();
	const controller = createLabApp({
		luxURL: baseURL,
		luxSecretKey: secretKey,
		controllerKey,
		port: 3000,
		fetch: globalThis.fetch
	});
	await expectStatus(
		'trusted controller reports engine health',
		await controller.request('http://lux-lab.test/v1/health'),
		200
	);
	await expectStatus(
		'trusted controller reaches protected push stats',
		await controller.request('http://lux-lab.test/v1/push/stats', {
			headers: { authorization: `Bearer ${controllerKey}` }
		}),
		200
	);

	await expectStatus(
		'custom callback allow-list configured',
		await request('auth/v1/admin/settings', {
			method: 'PATCH',
			key: 'secret',
			body: JSON.stringify({
				redirect_allow_list: [
					'lux-lab://auth/callback',
					'http://localhost:5174/auth/callback'
				]
			})
		}),
		200
	);

	const missingPKCE = await request(
		'auth/v1/authorize?provider=google&redirect_to=lux-lab%3A%2F%2Fauth%2Fcallback&flow=code'
	);
	await expectStatus('custom-scheme OAuth rejects missing PKCE', missingPKCE, 400);

	const signupResponse = await request('auth/v1/signup', {
		method: 'POST',
		body: JSON.stringify({ email, password })
	});
	await expectStatus('email signup returns a session', signupResponse, 200);
	const session = (await signupResponse.json()) as Session;
	if (!session.access_token || !session.refresh_token || !session.user?.id) {
		throw new Error('signup response did not contain a complete session');
	}
	userID = session.user.id;

	await expectStatus(
		'user JWT registers its own APNs token',
		await request('push/devices', {
			method: 'POST',
			bearer: session.access_token,
			body: JSON.stringify({
				token: fakeDeviceToken,
				platform: 'ios',
				app_id: 'dev.luxdb.lab',
				environment: 'sandbox'
			})
		}),
		200
	);

	const devicesResponse = await request('push/devices', { bearer: session.access_token });
	await expectStatus('user JWT lists only its own devices', devicesResponse, 200);
	const devices = (await devicesResponse.json()) as { devices?: Array<{ app_id?: string }> };
	if (devices.devices?.length !== 1 || devices.devices[0]?.app_id !== 'dev.luxdb.lab') {
		throw new Error('registered device was not returned with the expected app id');
	}

	await expectStatus(
		'user JWT removes its own token',
		await request('push/devices', {
			method: 'DELETE',
			bearer: session.access_token,
			body: JSON.stringify({ token: fakeDeviceToken })
		}),
		200
	);

	await expectStatus(
		'session signs out remotely',
		await request('auth/v1/logout', {
			method: 'POST',
			bearer: session.access_token,
			body: JSON.stringify({ refresh_token: session.refresh_token })
		}),
		200
	);
} finally {
	if (userID) {
		const cleanup = await request(`auth/v1/admin/users/${encodeURIComponent(userID)}`, {
			method: 'DELETE',
			key: 'secret'
		});
		await expectStatus('smoke user removed', cleanup, 200);
	}
}

console.log('Lux Lab local Auth + Push smoke passed (credentials redacted).');
