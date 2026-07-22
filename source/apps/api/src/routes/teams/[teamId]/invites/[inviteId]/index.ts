import { Hono } from "hono";
import { getInvite, requireRole, type MemberEnv } from "../../../../../middleware";
import { lux } from "../../../../../utils/lux";
import { buildError, buildSuccess } from "../../../../../utils/result";
import type { Invites } from "../../../../../types/lux";
import type { BlankSchema } from "hono/types";

const TeamIdInviteIdRouter = new Hono<MemberEnv, BlankSchema, "/:inviteId">().use(getInvite);

TeamIdInviteIdRouter.get(
    "/",
    async (c) => {
        return c.json(buildSuccess<Invites>(c.var.invite));
    }
);

TeamIdInviteIdRouter.delete(
    "/",
    requireRole("admin"),
    async (c) => {
        const { data, error } = await lux.table("invites").delete().eq("id", c.var.invite.id).single();
        if (error) {
            console.error(error);
            return c.json(buildError("LuxError", error), 500);
        }

        return c.json(buildSuccess<Invites>(data));
    }
);

export default TeamIdInviteIdRouter;