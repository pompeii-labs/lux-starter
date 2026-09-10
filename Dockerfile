FROM oven/bun:1.3.3-debian@sha256:599ad8f1446d3c552b432b9f6748fb21ec9106939a41a9cb6da9b37b44cebff8 AS base

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl tini \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL --retry 3 --retry-all-errors \
        https://github.com/lux-db/lux/releases/download/v0.37.0/lux-linux-amd64 \
        -o /usr/local/bin/lux-engine \
    && echo "b7fa76ce998c66454cee1e55e966c6c378c7e009dcab4fdd56dc4465e2241155  /usr/local/bin/lux-engine" | sha256sum -c - \
    && chmod 0755 /usr/local/bin/lux-engine \
    && curl -fsSL --retry 3 --retry-all-errors \
        https://github.com/lux-db/lux/releases/download/cli-v0.28.0/lux-cli-linux-x86_64.tar.gz \
        -o /tmp/lux-cli.tar.gz \
    && echo "461f699a4540f83ecbaa08c9f19006fbba92db20bbf091bc3863add893e6855d  /tmp/lux-cli.tar.gz" | sha256sum -c - \
    && tar -xzf /tmp/lux-cli.tar.gz -C /tmp \
    && install -m 0755 /tmp/lux-cli-linux-x86_64 /usr/local/bin/lux-cli \
    && rm -f /tmp/lux-cli.tar.gz /tmp/lux-cli-linux-x86_64

FROM base AS build

WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile \
    && bun run build

FROM base

WORKDIR /app
COPY --from=build /app /app
RUN chmod 0755 /app/docker-entrypoint.sh \
    && mkdir -p /data

EXPOSE 3000 5173 5890
ENTRYPOINT ["/usr/bin/tini", "--", "/app/docker-entrypoint.sh"]
