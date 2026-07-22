import { apiUrl, type Result } from "../helpers";
import type { Invites, Teams } from "$lib/types/lux";

export async function getInvites(props: { token: string; fetch: typeof fetch }): Promise<Result<Invites[]>> {
    const response = await props.fetch(apiUrl("/invites"), {
        headers: {
            Authorization: `Bearer ${props.token}`,
            Accept: "application/json",
        }
    });
    
    return await response.json();
}

export async function getInvitesForTeam(props: { token: string; team_id: Teams["id"], fetch: typeof fetch }): Promise<Result<Invites[]>> {
    const response = await props.fetch(apiUrl(`/teams/${props.team_id}/invites`), {
        headers: {
            Authorization: `Bearer ${props.token}`,
            Accept: "application/json",
        }
    });
    
    return await response.json();
}