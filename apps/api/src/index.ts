import { createApp } from './app';

const configuredPort = Number(Bun.env.API_PORT ?? '3000');
const port = Number.isInteger(configuredPort) && configuredPort > 0 && configuredPort <= 65535
	? configuredPort
	: 3000;
const hostname = Bun.env.API_HOST ?? '127.0.0.1';

createApp().listen({ hostname, port });
console.info({ event: 'api_started', hostname, port });
