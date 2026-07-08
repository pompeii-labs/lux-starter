import { apiUrl, type Result } from "../helpers";
import type { Invites, Teams } from "$lib/types/lux";

export async function acceptInvite(props: { token: string; fetch: typeof fetch; invite: Invites }): Promise<Result<Teams>> {
    const url = new URL(apiUrl(`/invites/${props.invite.id}/accept`));

    const response = await props.fetch(url.toString(), {
        method: "POST",
        headers: {
            Authorization: `Bearer ${props.token}`,
            Accept: "application/json",
        },
    });
    
    return await response.json();
}
