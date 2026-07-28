# zsc-app-demo

A living example of an application on the **ZeroServer Community Cloud (ZSC)**:
a Node API backed by Postgres. Use it as a starting point to deploy your own app.

The API talks to Postgres by the service name `db` over the app's private network
(no IPs), and the `api` service is `exposed`, so it gets a public HTTPS URL:
`https://app-xxx.apps.zeroserver.cc`.

```
zsc-app-demo/
├── api/              # Node + Express + pg
│   ├── index.js
│   ├── package.json
│   └── Dockerfile
├── zs.yaml           # the ZS application manifest (db + api)
├── docker-compose.yml# run it locally
└── README.md
```

## Run it locally

```bash
docker compose up --build
# in another terminal:
curl http://localhost:3000/        # {"message":"...","visits":1}
curl http://localhost:3000/health  # {"ok":true}
```

Each request to `/` writes a row to Postgres and returns the running visit count,
proving the API ↔ database connection over the private network.

## Deploy it to the ZS

0. **Install the CLI** (standalone binary, no Node required):

   ```bash
   curl -fsSL https://raw.githubusercontent.com/zeroserver-cc/zsc-cli/main/install.sh | sh
   ```

1. **Build and publish the API image** to a registry (GHCR, Docker Hub, …). The ZS
   runs your prebuilt image; it does not build from source in the MVP:

   ```bash
   docker build -t ghcr.io/<your-org>/zsc-app-demo-api:1.0 ./api
   docker push ghcr.io/<your-org>/zsc-app-demo-api:1.0
   ```

   Make the image **public** so the ZS can pull it without credentials. (Private
   images are supported from Sprint 11 via `zs registry login`.)

2. **Point `zs.yaml` at your image** (edit the `api.image` field). The bundled
   value `ghcr.io/zeroserver-cc/zsc-app-demo-api:1.0` is the published demo image.

3. **Deploy** with the ZS CLI — `zs deploy` reads `zs.yaml` and brings up both
   services (`db` + `api`):

   ```bash
   zs login
   zs deploy           # reads zs.yaml, creates the app and deploys it
   zs list             # follow until RUNNING; shows the public URL
   #   → https://app-xxx.apps.zeroserver.cc
   curl https://app-xxx.apps.zeroserver.cc/
   zs logs zsc-app-demo
   zs stop zsc-app-demo
   ```

The `db` service starts before `api` (`dependsOn`), and the API retries its
database connection on startup, so a cold deploy comes up cleanly.

> Deploying a single container instead of a full `zs.yaml`? Use the shortcut:
> `zs deploy <image> --port <port>`.

## The manifest (`zs.yaml`)

See [`zs.yaml`](./zs.yaml). Field-by-field reference:
[`docs/zs-yaml-reference.md`](./docs/zs-yaml-reference.md) — the canonical, complete
manifest reference (services, `ai` requirements, `placement`, volumes, private registries,
custom domains and deploy flow).

## MVP limits to know

- **1 instance per app**, 1 URL — no replicas or load balancing yet (Phase 2).
- **Postgres data is not replicated**: the named volume lives on one node; if that
  node is replaced, the data is lost. Don't use it for critical data yet. Managed
  Postgres (DBaaS) is Phase 2.
- **No build from source**: the ZS runs your prebuilt image. Build is Phase 2.
