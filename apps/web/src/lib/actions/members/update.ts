import { apiUrl, type Result } from "../helpers";
import type { Members } from "$lib/types/lux";

export async function updateMember(props: { token: string, update: Partial<Members>; fetch: typeof fetch }): Promise<Result<Members>> {
    const response = await fetch(apiUrl(`/teams/${props.update.team_id}/members/${props.update.id}`), {
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
