# `zs.yaml` — Application Manifest Reference

> Complete reference for deploying an application on the **ZeroServer Community Cloud (ZSC)**.
> This is the canonical, authoritative version of the manifest reference — kept in sync with
> what the `zs` CLI and the ZSC backend actually accept.

## 1. Concepts

An **application** on the ZSC is one or more **services** (containers), co-located on the same
community node, on a private network where services reach each other **by name**. The service
marked `exposed: true` gets a unique public HTTPS URL: `https://app-xxx.apps.zeroserver.cc`.

- **Prebuilt images only**: services run registry images. The ZSC never builds from source (MVP).
- **1 instance per app** in the MVP (no replicas/load balancing yet — Phase 2).
- **Named volumes** give containers persistence, but data is **not replicated** in the MVP.
  Do not use it for critical data yet. Managed databases are Phase 2.

The `zs` CLI parses and validates `zs.yaml` locally, then sends the composition to the backend
via GraphQL. The rules below are the user-facing contract; where the CLI and the backend differ,
that is called out explicitly.

## 2. Full example

```yaml
app: my-api

ai:                 # optional — hard AI/ML requirements for scheduling
  gpu: true
  image: true

placement:          # optional — soft geographic preference
  country: br

services:
  - name: db
    image: postgres:16-alpine
    env:
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=app
    volumes:
      - pgdata:/var/lib/postgresql/data

  - name: api
    image: ghcr.io/your-user/my-api:1.0
    env:
      - DATABASE_URL=postgres://postgres:secret@db:5432/app
    ports:
      - "3000"
    dependsOn:
      - db
    exposed: true
```

## 3. App-level fields

| Field | Type | Required | Description |
|---|---|---|---|
| `app` | string | yes | Application name. Non-empty, max 255 chars. Not unique — `zs deploy` reuses an existing app of yours with the same name. |
| `services` | list | yes | Non-empty list of services (see §4). No upper limit. |
| `ai` | mapping | no | AI/ML capability requirements (see §5). |
| `placement` | mapping | no | Soft geographic preference (see §6). |

Unknown top-level keys are silently ignored.

## 4. Service fields

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Service name. Must be **unique within the app**. Becomes the internal hostname — other services connect to it by this name (e.g. `db:5432`). |
| `image` | string | yes | Registry image, already built (e.g. `postgres:16-alpine`, `ghcr.io/org/app:1.0`). For private images see §8. |
| `env` | list of strings | no | Environment variables in `KEY=VALUE` format, one per entry. Not validated — malformed entries are passed to Docker as-is. |
| `ports` | list of strings | no | Container ports the service listens on (e.g. `"3000"`). **Container port only** — there is no `host:container` mapping; the host port is always assigned by the platform. TCP only; UDP is not reachable via `zs.yaml`. Quote values that YAML would read as numbers-with-colons. |
| `volumes` | list of strings | no | Mounts (see §7). Named volumes persist; bind mounts do not. |
| `dependsOn` | list of strings | no | Services that must start before this one. Every referenced name must exist in the same app, and dependency **cycles are rejected**. Start order follows the dependency graph. |
| `command` | list of strings | no | Overrides the image's `CMD` (the argv the container runs, e.g. `["yarn", "worker:prod"]` to run a worker process from the same image). Use it to run an alternative process of the same image as a separate service. |
| `exposed` | boolean | no | `true` on the service that gets the public URL. **Exactly one** service must be exposed — at least one (backend) and at most one (CLI). |

Validation rules enforced on deploy:

- At least one service; service names unique per app.
- `dependsOn` references must point to declared services; cycles fail with `Dependency cycle detected`.
- Exactly one `exposed: true` (the "at most one" half is CLI-side only).

### What `zs.yaml` does NOT support

There is no `args`, `restart`, `healthcheck`, `resources`, `labels`, `networks`
or `build` per service. Start-command overrides are supported via `command`;
anything else belongs in the image's `ENTRYPOINT`/`CMD`.
The backend API has an `ApplicationConfig` type with some of these fields, but it belongs to a
legacy single-image path and is **not reachable from `zs.yaml`**.

## 5. `ai` — AI/ML requirements

```yaml
ai:
  gpu: true    # requires a detected GPU
  llm: true    # requires LLM capability (GPU with >= 8 GB VRAM, or Apple Silicon with >= 8 GB unified memory)
  video: true  # requires video generation capability
  audio: true  # requires audio generation/synthesis capability
  image: true  # requires image generation capability
```

All five keys are optional booleans (unknown keys are ignored). Each `true` is a **hard
scheduling requirement**: the scheduler only picks community nodes whose agent reported the
matching capability. If no node matches, the deploy fails with a no-eligible-node error.

## 6. `placement` — geographic preference

```yaml
placement:
  country: br        # 2-letter ISO 3166-1 alpha-2 code
  region: RS           # free-form region string, matched against node region codes (e.g. RS, SP)
```

Both optional. Unlike `ai`, this is a **soft** preference: the scheduler tries matching nodes
first, then falls back to the whole network. Matching is case-insensitive. Note that volume
affinity (a node pinned by existing volumes) overrides the geographic preference entirely.

## 7. Volumes

Two syntaxes in a service's `volumes` list:

```yaml
volumes:
  - pgdata:/var/lib/postgresql/data   # named volume — persistent
  - /host/path:/container/path        # bind mount — not persistent, passed to Docker
```

- **Named volume** (`name:/absolute/container/path`): the container path must be absolute and
  the name must be unique per app. Named volumes become first-class platform volumes:
  they are snapshotted and pinned to a node (see §10). A `:ro` suffix on a named volume is
  silently ignored by the platform — the entry stops being treated as a managed volume and
  loses snapshot/pinning — so don't use it.
- **Bind mount** (`/host:/container`): passed through to Docker, not validated, not persistent.
  Avoid it — the host filesystem belongs to a community provider.
- Quote any entry containing `:` so YAML parses it as a string.

## 8. Private images

If an `image` lives in a **private** registry, register a read-only credential once:

```bash
zs registry login ghcr.io --username your-user   # token asked via hidden prompt
zs registry list                                  # host, user and a masked token hint (last 4 chars)
zs registry logout ghcr.io                        # removes the credential
```

Or in the portal under **Settings → Registries**.

- The token is stored **encrypted at rest** (AES-256-GCM) and is never returned by any query.
- At deploy time it is delivered to the hosting node over an encrypted channel, sealed with the
  machine token; the node just does an authenticated `docker pull`.
- Use a **least-privilege** token (on GHCR, `read:packages`). One credential per registry,
  reusable across apps. Public images need no credential.

## 9. Custom domains

Domains attach to the **application** (not an instance), so they survive redeploys and failover:

```bash
zs domain add api.example.com --app my-api   # returns DNS instructions (TXT verification token)
zs domain verify api.example.com             # checks the TXT record; routing + TLS go live
zs domain list --app my-api                  # --app is optional here
zs domain remove api.example.com
```

Add the TXT record at your DNS provider, verify, then point a CNAME/A record at the ZS gateway.
Domains inside the platform zone (`*.zeroserver.cc`) are reserved.

## 10. Volume snapshots and restore

```bash
zs volume ls <application-id>        # volumes, mount paths, pinned node, last snapshot
zs volume restore <application-id>   # queues a restore from the latest snapshot
```

Named volumes are snapshotted to object storage and pinned to a node; the pin drives the
scheduler's placement of your app.

## 11. Deploy flow

```bash
zs login            # authenticate
zs deploy           # reads zs.yaml, creates the app (or reuses it by name) and deploys
zs list             # follow until RUNNING; shows the public URL and the instance ID
zs logs <instance-id>   # application logs (instance ID from the deploy output or zs list)
zs stop <instance-id>   # stops and frees resources
```

Deploying a single container instead of a full `zs.yaml`? Use the shortcut:
`zs deploy <image> --port <port>`.

The portal's deploy wizard accepts the same composition and shows the URL at the end.

## 12. MVP limits

- **1 instance per app**, 1 URL — no replicas or load balancing yet (Phase 2).
- **No build from source** — bring a prebuilt image (Phase 2 will add builds).
- **No managed database** — the Postgres service's named volume is snapshotted, but data
  survives only up to the latest snapshot; on failover the app is restored from it and recent
  writes can be lost. Don't use it for critical data yet. DBaaS is Phase 2.
- **No hosted registry** — use your own (GHCR, Docker Hub); private images work via
  `zs registry login`.

## 13. More examples

Static frontend (Vite build served on port 80), single service:

```yaml
app: my-frontend
services:
  - name: web
    image: ghcr.io/your-user/my-frontend:1.0
    ports:
      - "80"
    exposed: true
```

AI image-generation app that requires a GPU node:

```yaml
app: my-image-ai
ai:
  gpu: true
  image: true
services:
  - name: api
    image: ghcr.io/your-user/ia-imagem-api:1.0
    ports:
      - "8000"
    exposed: true
```
