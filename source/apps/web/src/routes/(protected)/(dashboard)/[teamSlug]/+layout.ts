import { error, redirect } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import { resolve } from "$app/paths";
import { getMembers } from "$lib/actions/members";
import { getInvitesForTeam } from "$lib/actions/invites";

export const load: LayoutLoad = async (event) => {
    event.depends("lux:members");
    event.depends("lux:invites");
    const { teams, session } = await event.parent();

    const team = teams.find(t => t.slug === event.params.teamSlug);

    if (!team) {
        redirect(303, resolve("/(protected)/account"));
    }

    const members = await getMembers({
        token: session.access_token,
        team_id: team.id,
        fetch: event.fetch,
    });
    if (!members.success) {
        error(500, {
            message: members.error.message
        });
    }

    const invites = await getInvitesForTeam({
        token: session.access_token,
        fetch: event.fetch,
        team_id: team.id,
    });
    if (!invites.success) {
        error(500, {
            message: invites.error.message,
        });
    }

    return {
        team,
        members: members.data,
        invites: invites.data,
    }
}