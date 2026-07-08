import type { PageLoad } from "./$types";
import { getInvites } from "$lib/actions/invites";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async (event) => {
    event.depends("lux:invites");
    const { session } = await event.parent();

    const invites = await getInvites({ token: session.access_token, fetch: event.fetch })
    if (!invites.success) {
        error(500, {
            message: JSON.stringify(invites.error)
        })
    }

    return {
        invites: invites.data,
    }
}