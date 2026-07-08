import { Hono } from "hono";
import * as Bun from "bun";
import { cors } from "hono/cors";
import Router from "./routes";


const app = new Hono().basePath("/v1").use(cors());

app.get("/", async (c) => c.status(200));

app.route("/", Router);

const server = Bun.serve({
    port: 3000,
    fetch: app.fetch,
});

console.log(`Listening on ${server.url}`);
