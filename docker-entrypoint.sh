#!/usr/bin/env bash
set -euo pipefail

mkdir -p /data
keys=/data/starter-keys.env
if [[ ! -f "$keys" ]]; then
    umask 077
    printf 'LUX_PUBLISHABLE_KEY=lux_pub_%s\nLUX_SECRET_KEY=lux_sec_%s\n' \
        "$(od -An -N24 -tx1 /dev/urandom | tr -d ' \n')" \
        "$(od -An -N32 -tx1 /dev/urandom | tr -d ' \n')" > "$keys"
fi
set -a
# shellcheck disable=SC1090
source "$keys"
set +a

export LUX_PORT=6379
export LUX_HTTP_PORT="${POMPEII_LUX_PORT:-5890}"
export LUX_BIND_HOST=0.0.0.0
export LUX_PASSWORD="$LUX_SECRET_KEY"
export LUX_AUTH_ENABLED=true
export LUX_AUTH_PUBLISHABLE_KEY="$LUX_PUBLISHABLE_KEY"
export LUX_AUTH_SECRET_KEY="$LUX_SECRET_KEY"
export LUX_AUTH_ISSUER="${POMPEII_LUX_URL:-http://127.0.0.1:${LUX_HTTP_PORT}}/auth/v1"
export LUX_DATA_DIR=/data
export LUX_SAVE_INTERVAL="${LUX_SAVE_INTERVAL:-60}"
export LUX_MAXMEMORY="${LUX_MAXMEMORY:-256mb}"
export LUX_SHARDS="${LUX_SHARDS:-4}"

export LUX_URL="http://127.0.0.1:${LUX_HTTP_PORT}"
export API_URL=http://127.0.0.1:3000
export PUBLIC_LUX_URL="${POMPEII_LUX_URL:-$LUX_URL}"
export PUBLIC_LUX_PUBLISHABLE_KEY="$LUX_PUBLISHABLE_KEY"
export PUBLIC_API_URL="${POMPEII_API_URL:-$API_URL}"
export ORIGIN="${POMPEII_WEB_URL:-http://127.0.0.1:5173}"
export HOST=0.0.0.0

pids=()
shutdown() {
    trap - TERM INT EXIT
    if ((${#pids[@]})); then
        kill -TERM "${pids[@]}" 2>/dev/null || true
        wait "${pids[@]}" 2>/dev/null || true
    fi
}
trap shutdown TERM INT EXIT

/usr/local/bin/lux-engine &
pids+=("$!")

ready=false
for _ in $(seq 1 120); do
    if curl -fsS \
        -H "apikey: $LUX_SECRET_KEY" \
        -H "Authorization: Bearer $LUX_SECRET_KEY" \
        "http://127.0.0.1:${LUX_HTTP_PORT}/v1/version" >/dev/null; then
        ready=true
        break
    fi
    sleep 1
done
if [[ "$ready" != true ]]; then
    echo "Lux did not become ready" >&2
    exit 1
fi

target="lux://:${LUX_SECRET_KEY}@127.0.0.1:${LUX_PORT}"
/usr/local/bin/lux-cli migrate run "$target" --dir lux/migrations
if [[ ! -f /data/.starter-seeded ]]; then
    /usr/local/bin/lux-cli seed run "$target" --file lux/seed.lux
    touch /data/.starter-seeded
fi

bun run --cwd apps/api start &
pids+=("$!")
bun run --cwd apps/web start &
pids+=("$!")

set +e
wait -n "${pids[@]}"
status=$?
set -e
exit "$status"
