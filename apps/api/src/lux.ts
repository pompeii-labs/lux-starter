import type { LabConfig } from './config';

export async function luxRequest(
	config: LabConfig,
	path: string,
	init: RequestInit = {},
	bearerToken: string = config.luxSecretKey
): Promise<Response> {
	const url = `${config.luxURL}/${path.replace(/^\/+/, '')}`;
	const headers = new Headers(init.headers);
	headers.set('accept', 'application/json');
	headers.set('apikey', config.luxSecretKey);
	headers.set('authorization', `Bearer ${bearerToken}`);
	if (init.body && !headers.has('content-type')) {
		headers.set('content-type', 'application/json');
	}
	return config.fetch(url, { ...init, headers });
}

export async function forwardLux(response: Response): Promise<Response> {
	const contentType = response.headers.get('content-type') ?? 'application/json';
	return new Response(await response.arrayBuffer(), {
		status: response.status,
		headers: { 'content-type': contentType }
	});
}
