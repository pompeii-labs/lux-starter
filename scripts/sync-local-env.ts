import { randomBytes } from 'node:crypto';

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

const local = parse(await Bun.file('.env.local').text());
const existingAPI = await Bun.file('apps/api/.env').exists()
	? parse(await Bun.file('apps/api/.env').text())
	: new Map<string, string>();
const controllerKey = existingAPI.get('LAB_CONTROLLER_KEY') || randomBytes(32).toString('base64url');

const url = requireValue(local, 'LUX_URL');
const publishableKey = requireValue(local, 'LUX_PUBLISHABLE_KEY');
const secretKey = requireValue(local, 'LUX_SECRET_KEY');

await Promise.all([
	Bun.write(
		'apps/api/.env',
		[
			`LUX_URL=${url}`,
			`LUX_SECRET_KEY=${secretKey}`,
			`LAB_CONTROLLER_KEY=${controllerKey}`,
			'PORT=3000',
			''
		].join('\n')
	),
	Bun.write(
		'apps/web/.env',
		[
			`PUBLIC_LUX_URL=${url}`,
			`PUBLIC_LUX_PUBLISHABLE_KEY=${publishableKey}`,
			'PUBLIC_API_URL=http://127.0.0.1:3000',
			''
		].join('\n')
	)
]);

console.log('Synced ignored local environment files for API and Web (values redacted).');
