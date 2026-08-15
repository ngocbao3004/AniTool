# AniTool Release Security

Fast protection path for Ani Deepth:

1. Keep development source in `PRODUCT/AfterEffects/AniDeepth`.
2. Build a release folder that excludes `bakup`, `DEV_TOOLS`, source docs, and dev scripts.
3. Compile `PRODUCT/AfterEffects/AniDeepth/host/main.jsx` to `main.jsxbin`.
4. Change release `CSXS/manifest.xml` to load `./host/main.jsxbin`.
5. Obfuscate/minify `client/js/app.js` and `client/js/cep.js`.
6. Require AniTool Manager verification before exposing product actions.
7. Never ship Firebase SDKs, Admin SDK keys, database passwords, service account JSON, or device credentials inside the CEP extension.

Firebase CMS manages licenses and AniTool Manager handles activation. Neither replaces JSXBIN/obfuscation for protecting local CEP code.
