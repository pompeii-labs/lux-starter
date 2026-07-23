import { apiUrl, type Result } from "../helpers";
import type { Profiles } from "$lib/types/lux";

export async function updateProfile(props: { token: string, update: Omit<Profiles, "id" | "created_at">; fetch: typeof fetch }): Promise<Result<Profiles>> {
    const response = await fetch(apiUrl("/profiles/me"), {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${props.token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(props.update)
    });
    
    return await response.json();
}
