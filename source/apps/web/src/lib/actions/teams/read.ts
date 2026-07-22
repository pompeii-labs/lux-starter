import { apiUrl, type Result } from "../helpers";
import type { Teams } from "$lib/types/lux";

export async function getTeams(props: { token: string; fetch: typeof fetch }): Promise<Result<Teams[]>> {
    const response = await props.fetch(apiUrl("/teams"), {
        headers: {
            Authorization: `Bearer ${props.token}`,
            Accept: "application/json",
        }
    });
    
    return await response.json();
}
