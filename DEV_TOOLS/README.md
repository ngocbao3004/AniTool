# AniTool Dev Notes

AniTool is now organized as a clean workspace shell. Root folders are intentionally broad, while product-specific files stay inside each product.

## Structure

```text
AniTool/
  WEBSITE/
    CMS/        Firebase CMS for license/user management.
    Site/       Public HTML website for hosting.
  PRODUCT/
    AfterEffects/
      AniDeepth/  After Effects CEP panel.
        docs/
        bakup/
        DEV_TOOLS/
  DEV_TOOLS/    Global workspace scripts/notes that are not tied to one product.
```

## Ani Deepth Install

From `F:\TOOL DESIGN\AniTool`:

```powershell
powershell -ExecutionPolicy Bypass -File .\PRODUCT\AfterEffects\AniDeepth\tools\install-dev.ps1
```

Restart After Effects, then open `Window > Extensions > Ani Deepth`.

## CMS Deploy

Firebase config now lives inside `WEBSITE/CMS`.

```powershell
cd WEBSITE\CMS
firebase deploy --only hosting,firestore
```

Before deploying, fill `firebase-config.js`, enable Email/Password Auth, create an admin user, and add Firestore doc `admins/{uid}`.
