# AniTool CMS

Static Firebase CMS for managing AniTool license keys through the trusted Cloudflare Worker Admin API.

## Security boundary

The browser is responsible only for Google sign-in and UI. It sends the current Firebase ID token to the Worker. The Worker verifies that token, checks `admins/{uid}` with its service account, validates the command, writes Firestore, and creates audit events.

`app.js` must not import the Firebase Firestore browser SDK or write `licenses`, `licenseEvents`, or `productReleases` directly. Firestore Rules deny those client-side admin operations.

## Firebase Setup

1. Open Firebase project `anitoolbase`.
2. Authentication > Sign-in method > enable Google.
3. Authentication > Settings > Authorized domains: add `localhost`, `ngocbao3004.github.io`, and future production domains.
4. `firebase-config.js` contains only the public Firebase web config.
5. Sign in to the CMS once with Google, then copy your Firebase user UID.
6. Create Firestore document `admins/{uid}` for that UID:

```json
{
  "email": "your-admin-email@example.com",
  "role": "owner"
}
```

## Simple Sales Flow

AniTool now uses license keys only:

1. Customer contacts you and pays outside the site.
2. Open CMS.
3. Create a license key for the correct product, plan, days, and max devices.
4. Send that license key to the customer.
5. Customer signs in on the AniTool site and activates the license key.
6. The same `licenses/{licenseKey}` document becomes active for that customer.

## License Collection

The Worker stores licenses in `licenses/{licenseKey}`:

```json
{
  "licenseKey": "PER-AD-XXXX-XXXX",
  "email": "",
  "ownerUid": "",
  "productId": "ani-deepth",
  "status": "available",
  "plan": "creator",
  "durationDays": 365,
  "maxDevices": 1,
  "devices": [],
  "deviceCount": 0
}
```

Status values:

- `available`: created by admin, not activated yet.
- `active`: activated by a customer account.
- `paused`: preserved by admin; remaining days are held in `pausedRemainingDays`.
- `blocked`: blocked by admin.
- `expired`: expired by duration or marked manually.
- `voided`: CMS action that permanently deletes the license document after confirmation.

Important license edits are written to `licenseEvents`. Privileged CMS commands are also written to `adminAuditEvents`. Both collections are unavailable to browser clients.

## Deploy

Deploy in this order so the old CMS is never locked out before the new API exists:

1. Validate and deploy the Worker from `WEBSITE/API/anitool-license-worker`.
2. Deploy CMS Hosting.
3. Test admin sign-in, listing, creating, editing, deleting, and release draft/publish.
4. Deploy Firestore Rules last.

Commands:

```powershell
cd F:\TOOL DESIGN\AniTool\WEBSITE\API\anitool-license-worker
npm test -- --run
npx tsc --noEmit
npx wrangler deploy

cd F:\TOOL DESIGN\AniTool\WEBSITE\CMS
firebase login
firebase deploy --only hosting
# Run only after the online CMS passes the smoke test.
firebase deploy --only firestore:rules
```

The production Admin API URL is configured as `ADMIN_API_URL` near the top of `app.js`. No service-account credential or private key belongs in the CMS folder.

## AniDeepth Verification Direction

The practical next step is connecting AniDeepth to the same license document:

1. User enters license key in AniDeepth.
2. AniDeepth sends `productId`, `licenseKey`, `deviceId`, and `appVersion` for verification.
3. Verification checks status, expiration, product match, and device limit.
4. AniDeepth unlocks only when the license is valid.
