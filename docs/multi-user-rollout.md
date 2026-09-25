# Multi-user rollout checklist

Do these in order. Nothing here deletes data: the migration only adds an
owner (`userId`) to existing documents.

## 1. Before anything
- [ ] Back up: `mongodump --uri "$MONGO_URI" --out ~/money-tracker-backup-$(date +%F)`
      and check the dump has all 14 collections.
- [ ] Rotate the MongoDB password (the old `.env` was committed to git history).
      Update `MONGO_URI` locally and in Railway.
- [ ] Check the GitHub repos are private.

## 2. Configure (local `.env` and Railway variables)
Generate two different secrets (run twice):

    node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

Set:

    NODE_ENV=production            (Railway)
    MONGO_URI=...
    JWT_ACCESS_SECRET=<secret 1>
    JWT_REFRESH_SECRET=<secret 2>
    PROD_FRONTEND_URL=https://<your site>     (or CLIENT_ORIGIN=...)

Railway must have ALL of these as dashboard variables: `.env` is no longer in
git, so the deploy can't read it from the repo any more.

Cookies: production defaults to `SameSite=None; Secure`, which works when the
site and the API are on different domains. If both are under one domain you
can set `COOKIE_SAME_SITE=strict`.

## 3. Migrate the existing data (local machine, against the real database)
Add to your local `.env` (never commit it):

    MIGRATION_OWNER_USERNAME=chrstphrvllrn
    MIGRATION_OWNER_PASSWORD=<the password you want for that account>

Then:

    npm run migrate:dry-run     # prints what would change; changes nothing
    npm run migrate             # assigns every existing document to chrstphrvllrn

Run it twice if you like: the second run reports 0 updated. Afterwards remove
`MIGRATION_OWNER_PASSWORD` from `.env`.

## 4. Deploy, server first, then client
- Merge `multi-user` in both repos and deploy. The old client stops working the
  moment the new server is live (every data route needs a login), so deploy the
  client right after the server.
- Sign in as `chrstphrvllrn` and confirm your data is there.
- On each browser you used before, sign in as `chrstphrvllrn` first: it carries
  over that browser's saved House budgets and calculator value.
