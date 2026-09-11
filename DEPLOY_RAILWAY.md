# Deploy Aurora on Railway (~1k users)

## Why Railway
Persistent volume for SQLite, always-on Node, simpler than Fly for this stack.

## Steps
1. Sign up / log in at https://railway.app (GitHub login is fine).
2. **New Project** → **Deploy from GitHub** → `vponugoti0-png/daily-tech-hub-work` (active work copy; public/upstream is `vponugoti0-png/daily-tech-hub`).
3. Service settings:
   - Builder: Dockerfile (repo root `Dockerfile`)
   - Add a **Volume** mounted at `/data` (1 GB is enough)
4. Variables (Settings → Variables):

```
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
DATA_DIR=/data
AUTH_SECRET=<openssl rand -base64 32>
AUTH_GOOGLE_ID=<from Google Cloud>
AUTH_GOOGLE_SECRET=<from Google Cloud>
AUTH_URL=https://<your-railway-domain>
AUTH_TRUSTED_ORIGINS=https://<your-railway-domain>
```

5. Generate a public domain (Settings → Networking → Generate Domain).
6. In Google Cloud OAuth client, add:
   - Origin: `https://<your-railway-domain>`
   - Redirect: `https://<your-railway-domain>/api/auth/callback/google`

SQLite file path: `/data/dth.sqlite` on the volume.
