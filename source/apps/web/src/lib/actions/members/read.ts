import { apiUrl, type Result } from "../helpers";
import type { Members, Profiles, Teams } from "$lib/types/lux";

export type MemberWithProfile = Members & Omit<Profiles, "id"> & { user_id: string };

export async function getMembers(props: { token: string; team_id: Teams["id"]; fetch: typeof fetch }): Promise<Result<MemberWithProfile[]>> {
    const response = await props.fetch(apiUrl(`/teams/${props.team_id}/members`), {
        headers: {
            Authorization: `Bearer ${props.token}`,
            Accept: "application/json",
        }
    });
    
    return await response.json();
}
