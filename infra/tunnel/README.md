# Public OAuth callback boundary

Lux Lab's iOS app connects directly to a private-LAN engine through Lux Swift's
explicit `.localDevelopment` policy. It does not need a proxy for Auth, APNs
registration, or normal API calls.

Google, GitHub, and Apple web OAuth are different: the provider must redirect
to `/auth/v1/callback/<provider>` from the public internet. For those checks,
temporarily expose only the engine's HTTP port with either ngrok or Tailscale
Funnel. Ordinary Tailscale Serve is tailnet-only and cannot receive a provider
callback. Native Sign in with Apple uses its direct token exchange and does not
need this public route.

## ngrok

```sh
ngrok http 15890
```

Use the assigned HTTPS origin to configure each provider's exact callback, for
example `https://example.ngrok.app/auth/v1/callback/google`, and set the same
redirect URI in the Lux provider configuration. The native app's final callback
remains `lux-lab://auth/callback` and must be on the project's redirect allow
list.

## Tailscale Funnel

If Funnel is enabled for the tailnet, expose local port 15890 and use the
resulting public HTTPS origin for the same provider callback paths. Funnel—not
Serve—is required because the provider is outside the tailnet.

Do not expose Studio, RESP, or the controller API through this route. Stop the
public endpoint immediately after the OAuth checks, and never commit tunnel
credentials or assigned URLs.
