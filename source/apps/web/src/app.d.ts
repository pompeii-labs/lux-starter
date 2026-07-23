import type { Database } from '$lib/types/lux';
import type { LuxProjectClient } from '@luxdb/sdk';
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			lux: LuxProjectClient<Database>;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
