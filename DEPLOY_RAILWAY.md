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
6. **Sharing with your team (required):**
   - Confirm **Public Networking** is on and you are sending the `https://….up.railway.app` app URL — not a Railway dashboard / project invite and not `*.railway.internal`.
   - Turn **off** Railway **deployment protection** / password (Settings → Networking or service Security). If this is on, only people logged into your Railway workspace can open the site.
   - Many corporate filters and browser protections **block the shared `*.up.railway.app` domain**. Railway has documented this. Add a **custom domain** (Settings → Networking → Custom Domain) and share that instead.
   - Slack / Teams / Outlook in-app browsers may fail to embed the page (`X-Frame-Options: DENY`). Ask teammates to **Open in browser**.
   - Set `AUTH_URL` and `AUTH_TRUSTED_ORIGINS` to the exact `https://` origin people type (custom domain if you added one).
7. In Google Cloud OAuth client, add:
   - Origin: `https://<your-railway-domain>`
   - Redirect: `https://<your-railway-domain>/api/auth/callback/google`

SQLite file path: `/data/dth.sqlite` on the volume.
