import { PUBLIC_API_URL } from "$env/static/public";
import type { LuxError } from "@luxdb/sdk";

export function apiUrl(route: string) {
    return PUBLIC_API_URL + "/v1" + route;
}

export type PossibleErrors = {
	LuxError: LuxError;
	ZodError: {
		message: string;
	};
	CustomError: {
		message: string;
	}
};

export type CustomError<T extends keyof PossibleErrors = keyof PossibleErrors> = {
	[K in T]: {
		name: K;
	} & PossibleErrors[K];
}[T];

export type ErrorResult<T = CustomError> = {
	success: false;
	error: T;
};

export type SuccessResult<T> = {
	success: true;
	data: T;
};

export type Result<T> = SuccessResult<T> | ErrorResult;