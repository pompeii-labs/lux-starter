# Device tunnel boundary

A physical iPhone cannot use the engine's loopback URL, and Lux Swift correctly
rejects cleartext remote HTTP. The device profile therefore uses a stable,
trusted HTTPS hostname routed through Cloudflare Tunnel to the local engine.

The template in `config.example.yml` describes three optional origins:

- `engine.lab.luxdb.dev` routes to the Lux engine on loopback port 5890.
- `web.lab.luxdb.dev` routes to SvelteKit on loopback port 5174.
- `api.lab.luxdb.dev` routes to the Hono controller on loopback port 3000.

Studio is intentionally absent. It remains loopback-only. The final catch-all
returns 404 so an unknown hostname never falls through to a local service.

Keep the tunnel credential JSON outside this repository and replace the
template UUID with a dedicated tunnel. Add Cloudflare Access in front of the
web and controller hostnames if they are exposed; do not place Access in front
of the engine hostname because OAuth callbacks and the iOS client must reach
Lux directly. Lux authentication and route authorization remain the engine's
security boundary.

Do not commit the rendered config or credentials. Validate it before running:

```sh
cloudflared tunnel ingress validate --config /path/to/lux-lab.yml
cloudflared tunnel run --config /path/to/lux-lab.yml <TUNNEL_UUID>
```
