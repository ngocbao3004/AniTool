# AniTool CMS

Static Firebase CMS for managing AniTool licenses.

## Firebase Setup

1. Create a Firebase project.
2. Enable Authentication > Email/Password.
3. Create your admin user in Authentication.
4. Copy `firebase-config.example.js` to `firebase-config.js`, then paste the Firebase web app config there. `firebase-config.js` is intentionally ignored by git.
5. Create Firestore document `admins/{uid}` for your admin user.
6. Deploy Firestore rules from `firestore.rules`.

## Deploy

Run Firebase CLI from this folder:

```powershell
cd F:\TOOL DESIGN\AniTool\WEBSITE\CMS
firebase deploy --only hosting,firestore
```

## License Collection

Licenses are stored in `licenses/{licenseKey}`:

```json
{
  "licenseKey": "ANID-XXXX-XXXX-XXXX",
  "email": "customer@example.com",
  "productId": "ani-deepth",
  "status": "active",
  "plan": "pro",
  "expiresAt": "2026-12-31",
  "maxDevices": 2,
  "devices": []
}
```

This CMS only manages data. Ani Deepth CEP will later call a verification endpoint or Cloud Function to unlock the panel.
