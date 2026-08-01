import { createLabApp } from './app';
import { loadConfig } from './config';

const config = loadConfig();
const app = createLabApp(config);

const server = Bun.serve({
	port: config.port,
	fetch: app.fetch
});

console.log(`Lux Lab API listening on ${server.url}`);
