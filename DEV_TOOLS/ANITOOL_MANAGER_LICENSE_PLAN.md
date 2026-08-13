# AniTool Manager License Plan

## Implementation Status - 2026-08-13

Completed:

- Cloudflare Worker Manager sign-in, account session and device binding.
- Customer license list, redeem, current-device activation and removal APIs.
- Firebase website callback for Google approval.
- CMS Distribution tab and admin-only Firestore rules.
- Manager signed-out, My Products, Add License and Credits views.
- Google avatar, light/dark theme and DPAPI credential storage.
- Smart Open / Update / Download action with primary-to-backup fallback.
- SHA-256 verification before Manager opens a directly downloaded package.
- Existing AniDeepth `--check` contract and online verification.
- Legacy Manager key migration through the signed-in Gmail.
- Local install and versioned win-x64 ZIP packaging with SHA-256 output.

Production endpoints:

```text
Worker: https://anitool-license-worker.anitool-license-worker.workers.dev
Website: https://ngocbao3004.github.io/AniTool/
CMS: https://anitoolbase.web.app/
```

Local release artifact:

```text
PRODUCT/Windows/AniToolManager/dist/AniToolManager-0.2.0-win-x64.zip
```

Manual release checks still required:

1. Sign in to Manager with the intended Google account.
2. Create a dedicated test key in CMS using the same Gmail.
3. Redeem the key in Manager and verify AniDeepth unlocks.
4. Add real primary and backup download URLs in the CMS Distribution tab.
5. Obtain a trusted Windows code-signing certificate before a public release.

## Objective

Turn AniTool Manager into the single license center for customers:

```text
User buys a license
-> Admin creates the license in CMS
-> Admin sends the key to the user
-> User signs in to AniTool Manager with Google
-> User pastes the key once
-> The product appears in My Products
-> AniTool products ask Manager for permission to run
```

CMS remains admin-only. Customers do not receive administrative controls.

## Customer Experience

### First activation

1. Open AniTool Manager.
2. Sign in with Google.
3. Select Add License.
4. Paste the license key.
5. Manager verifies the key, Google account, product and device limit.
6. The product appears in My Products.
7. The installed product is unlocked through Manager.

### Normal use

Manager displays:

```text
AniTool Manager
customer@gmail.com                       [Sign out]

MY PRODUCTS

AniDeepth
Active - 365 days left - 1/1 device
[Open] [Verify] [Download] [Remove this device]

                              [+ Add license]
```

The complete key is only shown while being entered. After activation, Manager
may display a masked value such as `AD-****-****`.

### New computer

1. Install AniTool Manager.
2. Sign in with the same Google account.
3. Manager downloads the licenses owned by that account.
4. Activate the required product on the current computer.
5. If the device limit is reached, remove the old device or contact admin.

## Existing Foundation To Keep

The current system already provides:

- CMS license creation.
- Firebase Google authentication.
- License ownership through `ownerUid`.
- Customer Gmail matching.
- Per-license device limits.
- Hashed device identifiers.
- Worker-side license verification.
- Windows DPAPI storage in Manager.
- AniDeepth background checks through `AniToolManager.exe --check`.
- License states such as active, expired, blocked, paused and cancelled.

These parts should be extended, not rewritten.

## Target Architecture

```text
CMS (admin)
  -> Firestore license records
  -> Product release and download settings

AniTool Website
  -> Marketing
  -> Company and product information
  -> Manager download, documentation and support
  -> Google authorization callback

Cloudflare License Worker
  -> Verifies Firebase identity
  -> Creates Manager account sessions
  -> Lists licenses for the signed-in user
  -> Binds keys to Google UID
  -> Activates and removes devices
  -> Verifies product entitlements
  -> Resolves the current product download source

AniTool Manager
  -> Google account state
  -> My Products
  -> Add License
  -> Device actions
  -> Download, update or open owned products
  -> Secure local credentials via DPAPI

AniTool products
  -> Ask Manager whether a product is allowed to run
```

Manager must not access Firestore directly. Customer operations go through the
License Worker.

## Phase 1 - Finalize Product Rules

Confirm these default rules before implementation:

1. Manager requires Google sign-in.
2. My Products only shows owned licenses.
3. Activated keys are masked and cannot be copied by default.
4. Customers can remove only the current device.
5. Admin controls full device resets in CMS.
6. Licensing remains online-only for the initial release.
7. One Google account can own licenses for multiple AniTool products.
8. Manager uses the Google account avatar directly and does not provide a
   separate avatar upload or editor.

## Phase 2 - Manager Account Session

Add a Google authorization flow dedicated to Manager:

1. Manager requests an authorization session from Worker.
2. Manager opens the official Google sign-in in the system browser.
3. Website sends the temporary Firebase ID token to Worker.
4. Worker verifies the Firebase token.
5. Worker creates a Manager session bound to the Google UID and device.
6. Manager stores the resulting credential with Windows DPAPI.

The system browser remains the authentication surface. Google OAuth should not
be embedded inside WebView2.

## Phase 3 - Customer License API

Add Worker operations for:

```text
Get current account
List licenses owned by the current account
Redeem a license key
Activate the current device
Remove the current device
Refresh all product entitlements
Revoke the Manager session
```

Expected API responsibilities:

- Verify every Manager session.
- Restrict results to the authenticated `ownerUid`.
- Validate customer email before first ownership binding.
- Enforce product matching.
- Enforce status and expiry.
- Enforce `maxDevices`.
- Record activation, verification and removal events.
- Never return admin-only fields.

## Phase 4 - CMS Product Distribution

Add a third CMS workspace tab:

```text
Create License | License List | Distribution
```

Each product release can contain:

- Product.
- Current version.
- Primary download URL.
- Backup download URL.
- Delivery mode: direct download or open a web page.
- Release status: available or temporarily unavailable.
- Optional short release note.

Admin controls should include:

- Test Primary Link.
- Test Backup Link.
- Save Distribution Settings.
- Set the preferred source.
- Temporarily disable the release.

Manager must not contain hardcoded download URLs. It asks Worker for the current
release action whenever the customer selects Download or Update.

For direct downloads, Manager tries the primary source first and falls back to
the backup source when the primary source cannot be reached. For web-page
delivery, Worker returns the currently selected page and Manager opens it in
the system browser.

The customer sees only one action. Primary and backup links remain an admin
implementation detail.

## Phase 5 - Real Manager UI

Replace the fixed demo catalog with account-driven views.

### Signed-out view

- AniTool branding.
- Continue with Google.
- Brief connection/error status.

### My Products view

- Signed-in Gmail and the avatar supplied by the Google account.
- No separate avatar upload, storage or editing feature.
- Product name and host software.
- License status.
- Remaining days.
- Current device count and limit.
- Open, Verify, Download or Update, and Remove This Device actions.
- Add License action.

The primary product action changes automatically:

```text
Not installed -> Download
New release available -> Update
Installed and current -> Open
Web delivery selected by admin -> Open Download Page
Release disabled -> Unavailable
```

### Add License view

- One license key input.
- Add Product command.
- Clear validation errors.
- No product selector unless a future key format cannot identify the product.

### Credits view

Keep the existing Credits section and light/dark themes.

## Phase 6 - Product Unlock Contract

Keep the existing product check command:

```text
AniToolManager.exe --check ani-deepth --output result.json
```

Expected result codes include:

```text
ACTIVE
NOT_ACTIVATED
EXPIRED
BLOCKED
PAUSED
DEVICE_LIMIT_REACHED
ACCOUNT_REQUIRED
NETWORK_REQUIRED
```

AniDeepth should not load Firebase, receive Google tokens or query Firestore.

## Phase 7 - Existing Installation Migration

1. Preserve valid product credentials already stored by Manager.
2. On the first upgraded launch, request one Google sign-in if no Manager
   account session exists.
3. Match existing product ownership to the returned Google UID.
4. Keep AniDeepth working during migration.
5. Do not delete local credentials until the replacement session succeeds.
6. Provide a recoverable error if the existing license belongs to another UID.

## Phase 8 - Anti-Sharing Controls

Use multiple controls together:

- Bind the license to the first verified Google UID.
- Require the verified Gmail to match the CMS customer email when supplied.
- Enforce `maxDevices`, normally `1`.
- Store only a device hash on the server.
- Encrypt Manager credentials with Windows DPAPI.
- Keep product credentials scoped to product, account and device.
- Log device activation, removal and verification timestamps.
- Allow admin to block a license or reset devices.
- Consider a cooldown or admin approval for repeated device changes later.

Google sign-in reduces casual key sharing but cannot prevent a customer from
deliberately sharing their complete Google account. Device limits remain the
hard enforcement layer.

## Phase 9 - Testing

Cover at least these cases:

1. Correct Gmail, valid key and first device.
2. Wrong Gmail for a preassigned license.
3. Key already owned by another Google UID.
4. Second device when `maxDevices` is one.
5. Same device activated again.
6. Expired, blocked, paused and cancelled licenses.
7. Removing the current device.
8. Reinstalling Manager on the same Windows account.
9. Signing in on a new computer.
10. Manager session expiry and reauthentication.
11. Network failure during sign-in, redeem and verification.
12. AniDeepth `--check` before and after activation.
13. Account A must never receive Account B license data.
14. Primary download succeeds.
15. Primary download fails and Manager uses the backup source.
16. Web-page delivery opens the system browser.
17. Admin changes a download URL without releasing a new Manager build.
18. Disabled releases show Unavailable and cannot be downloaded.
19. Light and dark themes display the Google account avatar correctly.

## Phase 10 - Release Order

Deploy in this order:

1. Add Worker APIs with automated tests while keeping existing endpoints.
2. Deploy Worker and verify backward compatibility.
3. Add the Distribution tab to CMS and save release settings.
4. Add Worker download-resolution behavior.
5. Build the new Manager account flow and My Products UI.
6. Add Download, Update, Open and fallback behavior to Manager.
7. Test with a dedicated test Gmail and test key.
8. Test primary and backup delivery sources.
9. Test AniDeepth against the upgraded Manager.
10. Package and install Manager on a clean Windows user profile.
11. Release Manager.
12. Remove obsolete website customer-dashboard behavior only after Manager is
   stable.

## Rollback Strategy

- Keep the current Worker endpoints during migration.
- Keep the current Manager installer as a stable fallback.
- Do not rewrite existing Firestore license documents destructively.
- Add new fields in a backward-compatible form.
- Deploy Worker before requiring the new Manager behavior.

## Current Decision Status

Recommended but awaiting final confirmation:

- Sign in when Manager opens.
- Show owned products only.
- Do not expose Copy Key after activation.
- Customers may remove only their current device.
- Full reset remains an admin action.
- Online-only for the first production release.
- Google supplies the customer avatar; AniTool does not manage custom avatars.
- Manager exposes one smart product action while CMS owns primary and backup
  delivery links.
