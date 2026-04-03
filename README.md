# Perihelion Status

A self-hosted status page for monitoring homelab services. Displays 90 days of uptime history with per-service breakdowns and a running "nines" score.

Built with **Deno**, **Hono**, and **htmx**.

## Features

- 90-day uptime history with color-coded day bars (green/yellow/red)
- Per-service uptime percentage and overall "nines" grade
- Background health checks every 60 seconds
- Auto-refreshing UI via htmx (no full page reloads)
- Persistent storage via Deno KV
- Dark theme

## Quick Start

```bash
cp services.example.json services.json
# Edit services.json with your actual service URLs
deno task dev
```

## Configuration

Services are defined in a JSON file:

```json
[
  {
    "id": "my-app",
    "name": "My App",
    "url": "http://myserver:8080/health",
    "expectedStatus": 200
  }
]
```

| Environment Variable | Default | Description |
|---|---|---|
| `SERVICES_FILE` | **(required)** | Path to services JSON file |
| `DENO_KV_PATH` | Deno default | Path to KV database file |
| `CHECK_INTERVAL_MS` | `60000` | Health check interval in ms |
| `HISTORY_DAYS` | `90` | Number of days to display |
| `PORT` | `3000` | HTTP server port |

## Docker

```bash
cp services.example.json services.json
# Edit services.json
docker compose up -d
```

The `docker-compose.yml` mounts `services.json` into the container and persists KV data in a named volume.

## Tech Stack

- [Deno](https://deno.land) — runtime
- [Hono](https://hono.dev) — web framework
- [htmx](https://htmx.org) — live UI updates
- [Deno KV](https://docs.deno.com/deploy/kv/manual/) — storage
