import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'postgresql',
	schema: './packages/db/src/schema.ts',
	out: './packages/db/drizzle',
	dbCredentials: {
		url: process.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@127.0.0.1:5433/dompis_dev'
	}
});
