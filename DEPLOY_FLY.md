# Deploy Aurora on Fly.io (~1k users)

## One-time
1. Install flyctl and `fly auth login`
2. From repo root: `fly apps create aurora-daily-tech-hub` (or keep name in fly.toml)
3. Create volume (if launch didn't): `fly volumes create aurora_data --region iad --size 1`
4. Set secrets (never commit these):

```bash
fly secrets set \
  AUTH_SECRET="$(openssl rand -base64 32)" \
  AUTH_GOOGLE_ID="..." \
  AUTH_GOOGLE_SECRET="..." \
  AUTH_URL="https://aurora-daily-tech-hub.fly.dev" \
  AUTH_TRUSTED_ORIGINS="https://aurora-daily-tech-hub.fly.dev"
```

5. Deploy: `fly deploy`
6. In Google Cloud Console, add authorized origin + redirect:
   - `https://<your-app>.fly.dev`
   - `https://<your-app>.fly.dev/api/auth/callback/google`

SQLite lives on the `aurora_data` volume at `/data/dth.sqlite`.
