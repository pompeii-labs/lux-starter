import type { LuxProjectClient } from '@luxdb/sdk';

declare global {
	namespace App {
		interface Locals {
			lux: LuxProjectClient;
		}
	}
}

export {};
