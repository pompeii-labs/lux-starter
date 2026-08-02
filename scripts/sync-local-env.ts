import { randomBytes } from 'node:crypto';
import { privateIPv4 } from './local-network';

function parse(source: string): Map<string, string> {
	const values = new Map<string, string>();
	for (const raw of source.split(/\r?\n/)) {
		const line = raw.trim();
		if (!line || line.startsWith('#')) continue;
		const separator = line.indexOf('=');
		if (separator < 1) continue;
		values.set(line.slice(0, separator), line.slice(separator + 1));
	}
	return values;
}

function requireValue(values: Map<string, string>, key: string): string {
	const value = values.get(key)?.trim();
	if (!value) throw new Error(`${key} is missing from .env.local; run lux start first`);
	return value;
}

function xcconfigURL(url: string): string {
	return url.replace('://', ':/$()/');
}

const local = parse(await Bun.file('.env.local').text());
const existingAPI = await Bun.file('apps/api/.env').exists()
	? parse(await Bun.file('apps/api/.env').text())
	: new Map<string, string>();
const controllerKey = existingAPI.get('LAB_CONTROLLER_KEY') || randomBytes(32).toString('base64url');

const url = requireValue(local, 'LUX_URL');
const publishableKey = requireValue(local, 'LUX_PUBLISHABLE_KEY');
const secretKey = requireValue(local, 'LUX_SECRET_KEY');
const deviceURL = new URL(url);
deviceURL.hostname = privateIPv4();
const deviceProjectURL = deviceURL.toString().replace(/\/$/, '');

if (await Bun.file('lux/.lux-local.json').exists()) {
	const state = (await Bun.file('lux/.lux-local.json').json()) as {
		http_port?: number;
		bind_host?: string;
	};
	const activePort = Number(new URL(url).port || (url.startsWith('https:') ? 443 : 80));
	if (state.http_port && activePort !== state.http_port) {
		throw new Error(
			`.env.local points to port ${activePort}, but the running Lux Lab state uses ${state.http_port}; run lux env use local first`
		);
	}
	const bindHost = state.bind_host?.trim();
	if (bindHost && bindHost !== '0.0.0.0' && bindHost !== deviceURL.hostname) {
		throw new Error(
			`Lux Lab is bound to ${bindHost}, but the device profile uses ${deviceURL.hostname}; restart lux with --bind ${deviceURL.hostname}`
		);
	}
}

await Promise.all([
	Bun.write(
		'apps/api/.env',
		[
			`LUX_URL=${url}`,
			`LUX_SECRET_KEY=${secretKey}`,
			`LAB_CONTROLLER_KEY=${controllerKey}`,
			'PORT=15892',
			''
		].join('\n')
	),
	Bun.write(
		'apps/web/.env',
		[
			`PUBLIC_LUX_URL=${url}`,
			`PUBLIC_LUX_PUBLISHABLE_KEY=${publishableKey}`,
			'PUBLIC_API_URL=http://127.0.0.1:15892',
			''
		].join('\n')
	),
	Bun.write(
		'apps/ios/LocalDevelopment.xcconfig',
		[
			`LUX_LAB_PROJECT_URL = ${xcconfigURL(deviceProjectURL)}`,
			`LUX_LAB_API_URL = ${xcconfigURL(`http://${deviceURL.hostname}:15892`)}`,
			`LUX_LAB_PUBLISHABLE_KEY = ${publishableKey}`,
			''
		].join('\n')
	)
]);

console.log(`Synced ignored API, Web, and iOS device profiles for ${deviceURL.hostname} (credentials redacted).`);
