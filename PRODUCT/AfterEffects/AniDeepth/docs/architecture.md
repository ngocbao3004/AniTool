# AniTool Architecture

AniTool is the umbrella workspace for tools, websites, CMS, and release helpers.

## Blocks

- `WEBSITE/CMS`: Firebase-hosted license CMS.
- `WEBSITE/Site`: public HTML website for hosting.
- `PRODUCT/AfterEffects/AniDeepth`: After Effects CEP extension.
- `DEV_TOOLS`: global workspace scripts/notes that are not tied to one product.

## Ani Deepth Product Files

Ani Deepth-specific docs, backups, and legacy references live inside `PRODUCT/AfterEffects/AniDeepth` so future products do not inherit this project's working clutter.

## Legacy

- `PRODUCT/AfterEffects/AniDeepth/DEV_TOOLS/legacy/distance-layer-jsx`: old JSX/source build tree kept for reference.

## License Direction

The CMS manages license data in Firestore. The CEP extension should not store Firebase admin secrets or database passwords. A later release should verify license state through a server-side Cloud Function and keep the local extension source protected with JSXBIN/obfuscation for release builds.
