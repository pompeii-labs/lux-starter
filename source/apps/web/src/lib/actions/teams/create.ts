import { apiUrl, type Result } from "../helpers";
import type { Teams } from "$lib/types/lux";

export async function createTeam(props: { token: string; fetch: typeof fetch; insert: Partial<Teams> }): Promise<Result<Teams>> {
    const response = await props.fetch(apiUrl("/teams"), {
        method: "POST",
        headers: {
            Authorization: `Bearer ${props.token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(props.insert)
    });
    
    return await response.json();
}
