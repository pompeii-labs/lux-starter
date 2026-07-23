import { error, redirect } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import { optionalQueryString } from "$lib/utils";
import { resolve } from "$app/paths";
import { AuthRoutes } from "$lib/routes";
import { getProfile } from "$lib/actions/profiles";
import { getTeams } from "$lib/actions/teams";

export const load: LayoutLoad = async (event) => {
    event.depends("lux:profiles", "lux:teams");
    const { session } = await event.parent();

    if (!session) {
        const searchParams = new URLSearchParams();
        searchParams.set('next', (event.url.pathname + optionalQueryString(event.url.searchParams)));
        redirect(303, resolve(AuthRoutes.login) + optionalQueryString(searchParams));
    }

    const profile = await getProfile({ token: session.access_token, fetch: event.fetch });
    if (!profile.success) {
        error(500, {
            message: JSON.stringify(profile.error)
        })
    }

    const teams = await getTeams({ token: session.access_token, fetch: event.fetch });
    if (!teams.success) {
        error(500, {
            message: JSON.stringify(teams.error)
        })
    }
    return {
        teams: teams.data,
        profile: profile.data,
        session,
    }
}
