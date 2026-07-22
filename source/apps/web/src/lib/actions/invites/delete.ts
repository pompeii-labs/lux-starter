import { apiUrl, type Result } from "../helpers";
import type { Invites } from "$lib/types/lux";

export async function deleteInvite(props: { token: string; fetch: typeof fetch; invite: Invites }): Promise<Result<Invites>> {
    const url = new URL(apiUrl(`/teams/${props.invite.team_id}/invites/${props.invite.id}`));

    const response = await props.fetch(url.toString(), {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${props.token}`,
            Accept: "application/json",
        }
    });
    
    return await response.json();
}
