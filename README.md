# AniTool

AniTool is the company/workspace for animation tools and public product websites.

## Structure

```text
AniTool/
  WEBSITE/
    Site/       Public website for customers.
    CMS/        License/admin CMS.
  PRODUCT/
    AfterEffects/
      AniDeepth/  Local product source. Not published by default.
  DEV_TOOLS/    Local notes, backups, scripts, and workflow helpers.
```

## Public Website

The current public site sells AniDeepth.

Local preview:

```powershell
start .\WEBSITE\Site\index.html
```

GitHub Pages deploys `WEBSITE/Site` through `.github/workflows/pages.yml`.

## GitHub Pages URL

After pushing to `main` and enabling Pages with GitHub Actions, the site should be available at:

```text
https://ngocbao3004.github.io/AniTool/
```

## Source Safety

This repo is prepared as a public website base. AniDeepth product source is ignored by default so a public GitHub Pages repo does not expose CEP/JSX code accidentally. Remove that ignore rule only if the repository is private and you intentionally want to version the product source.