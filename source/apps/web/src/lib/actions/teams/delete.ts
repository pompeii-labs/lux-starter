import { apiUrl, type Result } from "../helpers";
import type { Teams } from "$lib/types/lux";

export async function deleteTeam(props: { token: string; fetch: typeof fetch; team: Teams }): Promise<Result<Teams>> {
    const response = await props.fetch(apiUrl(`/teams/${props.team.id}`), {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${props.token}`,
            Accept: "application/json",
        },
    });
    
    return await response.json();
}
