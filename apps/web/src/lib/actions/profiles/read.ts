import { apiUrl, type Result } from "../helpers";
import type { Profiles } from "$lib/types/lux";

export async function getProfile(props: { token: string; fetch: typeof fetch }): Promise<Result<Profiles>> {
    const response = await props.fetch(apiUrl("/profiles/me"), {
        headers: {
            Authorization: `Bearer ${props.token}`,
            Accept: "application/json",
        }
    });
    
    return await response.json();
}
