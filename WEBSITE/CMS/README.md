# AniTool CMS

Static Firebase CMS for managing AniTool licenses.

## Firebase Setup

1. Create or open the Firebase project `anitoolbase`.
2. Authentication > Sign-in method > enable Google.
3. Authentication > Settings > Authorized domains: add the domains you will use, such as `localhost`, your GitHub Pages domain, and the later production domain.
4. `firebase-config.js` contains the local Firebase web config and is intentionally ignored by git.
5. Sign in to the CMS once with Google, then open Firebase Authentication and copy your user UID.
6. Create Firestore document `admins/{uid}` for that UID, for example:

```json
{
  "email": "your-admin-email@example.com",
  "role": "owner"
}
```

7. Deploy Firestore rules from `firestore.rules`.

## Deploy

Run Firebase CLI from this folder:

```powershell
cd F:\TOOL DESIGN\AniTool\WEBSITE\CMS
firebase login
firebase deploy --only hosting,firestore
```

## Recommended Sales Flow

First release should use manual payment plus redeem keys:

1. Customer contacts you and pays outside the site.
2. Open CMS > Redeem Codes.
3. Choose product, plan, days, max devices, quantity.
4. Generate a redeem key and send it to the customer.
5. Customer signs in on the AniTool site and enters the key.
6. The site creates `licenses/{redeemCode}` for that customer account and marks the code as redeemed.

The old manual license editor still exists for support cases, but the clean customer flow is redeem code first.

## Redeem Code Collection

Redeem codes are stored in `redeemCodes/{code}`:

```json
{
  "code": "ANI-DEEPTH-XXXX-XXXX",
  "productId": "ani-deepth",
  "plan": "creator",
  "durationDays": 365,
  "maxDevices": 1,
  "status": "available",
  "redeemedBy": "",
  "redeemedByEmail": ""
}
```

## License Collection

Licenses are stored in `licenses/{licenseKey}`:

```json
{
  "licenseKey": "ANI-DEEPTH-XXXX-XXXX",
  "sourceCode": "ANI-DEEPTH-XXXX-XXXX",
  "email": "customer@example.com",
  "ownerUid": "firebase-user-uid",
  "productId": "ani-deepth",
  "status": "active",
  "plan": "creator",
  "durationDays": 365,
  "maxDevices": 1,
  "devices": []
}
```

## AniDeepth Verification Direction

AniDeepth should not read Firestore directly. The right production path is:

1. User enters email/license key in AniDeepth.
2. AniDeepth sends `productId`, `licenseKey`, `deviceId`, and `appVersion` to a Cloud Function.
3. The Cloud Function checks status, expiration, product match, and device limit.
4. The Cloud Function returns a compact allow/deny result to the CEP panel.

This CMS manages license data first. The next step is adding Cloud Functions `activateLicense` and `verifyLicense`.
## Customer Site Flow

The public site owns customer registration/login:

1. Customer signs in with Google on `WEBSITE/Site`.
2. The site creates or updates `users/{uid}`.
3. Customer enters a redeem key.
4. The site creates a license where `licenses/{licenseKey}.ownerUid == uid`.
5. Customer can see licenses where `ownerUid == uid`.

CMS is for admin/license settings. It is not the customer registration surface.
