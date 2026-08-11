# AniTool Release Security

Fast protection path for Ani Deepth:

1. Keep development source in `PRODUCT/AfterEffects/AniDeepth`.
2. Build a release folder that excludes `bakup`, `DEV_TOOLS`, source docs, and dev scripts.
3. Compile `PRODUCT/AfterEffects/AniDeepth/host/main.jsx` to `main.jsxbin`.
4. Change release `CSXS/manifest.xml` to load `./host/main.jsxbin`.
5. Obfuscate/minify `client/js/app.js` and `client/js/cep.js`.
6. Add Firebase license verification before important host actions.
7. Never ship Firebase Admin SDK keys, database passwords, or service account JSON.

Firebase CMS manages licenses. It does not hide local CEP code by itself.
