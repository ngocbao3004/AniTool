# AniTool Architecture

AniTool is the umbrella workspace for tools, websites, CMS, and release helpers.

## Blocks

- `WEBSITE/CMS`: Firebase-hosted license CMS.
- `WEBSITE/Site`: public HTML website for hosting.
- `WEBSITE/API/anitool-license-worker`: private license API deployed to Cloudflare Workers.
- `PRODUCT/AfterEffects/AniDeepth`: After Effects CEP extension.
- `PRODUCT/Windows/AniToolManager`: native Windows manager shared by all AniTool products.
- `DEV_TOOLS`: global workspace scripts/notes that are not tied to one product.

## Ani Deepth Product Files

Ani Deepth-specific docs, backups, and legacy references live inside `PRODUCT/AfterEffects/AniDeepth` so future products do not inherit this project's working clutter.

## Legacy

- `PRODUCT/AfterEffects/AniDeepth/DEV_TOOLS/legacy/distance-layer-jsx`: old JSX/source build tree kept for reference.

## License Direction

The CMS manages license data in Firestore. AniTool Manager handles device activation once through the AniTool website and stores product credentials with Windows DPAPI. AniDeepth invokes Manager in background check mode and never loads Firebase, Google sign-in, admin secrets, database passwords, or device credentials.

The Cloudflare Worker is the only public component allowed to turn an authenticated customer approval into a device credential. Firestore service credentials remain Worker secrets.
