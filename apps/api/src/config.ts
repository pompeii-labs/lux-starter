export interface LabConfig {
	luxURL: string;
	luxSecretKey: string;
	controllerKey: string;
	port: number;
	fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
}

function required(name: string): string {
	const value = process.env[name]?.trim();
	if (!value) throw new Error(`${name} is required`);
	return value;
}

export function loadConfig(): LabConfig {
	const rawPort = process.env.PORT ?? '3000';
	const port = Number(rawPort);
	if (!Number.isInteger(port) || port < 1 || port > 65_535) {
		throw new Error(`PORT must be a valid TCP port, received ${rawPort}`);
	}

	return {
		luxURL: required('LUX_URL').replace(/\/+$/, ''),
		luxSecretKey: required('LUX_SECRET_KEY'),
		controllerKey: required('LAB_CONTROLLER_KEY'),
		port,
		fetch: (input, init) => globalThis.fetch(input, init)
	};
}
