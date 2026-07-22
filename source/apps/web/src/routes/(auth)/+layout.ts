// routes/(auth)/+layout.ts
import { redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import { AuthRoutes } from "$lib/routes";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ parent, url }) => {
    const { session } = await parent();

    if (session) {
        redirect(303, url.searchParams.get("next") ?? resolve(AuthRoutes.postLogin));
    }
};
