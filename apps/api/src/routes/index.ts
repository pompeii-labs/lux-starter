import { Hono } from "hono";
import ProfilesRouter from "./profiles";
import TeamsRouter from "./teams";
import InvitesRouter from "./invites";

const Router = new Hono();

Router.route("/profiles", ProfilesRouter);
Router.route("/teams", TeamsRouter);
Router.route("/invites", InvitesRouter);

export default Router;