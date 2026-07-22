import { apiUrl, type Result } from "../helpers";
import type { Invites } from "$lib/types/lux";

export async function createInvite(props: { token: string; fetch: typeof fetch; insert: Partial<Invites> }): Promise<Result<Invites>> {
    const url = new URL(apiUrl(`/teams/${props.insert.team_id}/invites`));

    const response = await props.fetch(url.toString(), {
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
