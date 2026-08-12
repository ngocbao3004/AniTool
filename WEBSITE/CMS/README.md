# AniTool CMS

Static Firebase CMS for managing AniTool license keys.

## Firebase Setup

1. Open Firebase project `anitoolbase`.
2. Authentication > Sign-in method > enable Google.
3. Authentication > Settings > Authorized domains: add `localhost`, `ngocbao3004.github.io`, and future production domains.
4. `firebase-config.js` contains the Firebase web config.
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

Licenses are stored in `licenses/{licenseKey}`:

```json
{
  "licenseKey": "AD-XXXX-XXXX",
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
- `voided`: soft-deleted/cancelled by admin. The document stays for sales history.

Important admin edits are also written to `licenseEvents` so license changes can be audited later.

## Deploy

Run Firebase CLI from this folder:

```powershell
cd F:\TOOL DESIGN\AniTool\WEBSITE\CMS
firebase login
firebase deploy --only hosting,firestore:rules
```

## AniDeepth Verification Direction

The practical next step is connecting AniDeepth to the same license document:

1. User enters license key in AniDeepth.
2. AniDeepth sends `productId`, `licenseKey`, `deviceId`, and `appVersion` for verification.
3. Verification checks status, expiration, product match, and device limit.
4. AniDeepth unlocks only when the license is valid.
