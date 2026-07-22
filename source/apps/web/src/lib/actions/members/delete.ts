import { apiUrl, type Result } from "../helpers";
import type { Members } from "$lib/types/lux";

export async function deleteMember(props: { token: string; fetch: typeof fetch; member: Members }): Promise<Result<Members>> {
    const url = new URL(apiUrl(`/teams/${props.member.team_id}/members/${props.member.id}`));

    const response = await props.fetch(url.toString(), {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${props.token}`,
            Accept: "application/json",
        }
    });
    
    return await response.json();
}
