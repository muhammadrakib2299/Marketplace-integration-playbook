# Documentation site and deployment

The searchable documentation site is built from the repository's existing Markdown files by VitePress. The site lives at the repository root so it can publish the existing `docs/` and `marketplaces/` content without maintaining a second copy. The VitePress configuration excludes repository-only and template files from the public site.

## Run locally

Use Node.js 22 or newer. From the repository root, install the locked dependencies and start the development server:

```sh
npm ci
npm run docs:dev
```

Build and preview the static site locally with:

```sh
npm run docs:build
npm run docs:preview
```

VitePress's built-in local search indexes the pages included in the site at build time. It does not require an external search service or API key. Add new marketplace guides as Markdown under `marketplaces/<slug>/` and list them in the marketplace's catalog entry (`build_sequence` and `pages` in `catalog/marketplaces.yaml`). The sidebar, the marketplace directory, each marketplace's overview header, and the homepage cards are generated from `catalog/marketplaces.yaml` and `catalog/guides.yaml` by `npm run data:generate`, which runs before `docs:dev` and `docs:build` and fails when a catalog link has no matching page. The `_template` directory is intentionally excluded from the public site.

## Vercel settings

A root-level `vercel.json` provides the build command and output directory. In the Vercel project settings, set the **Root Directory** to the repository root (`.`) and use Node.js 22 or newer. If project-level overrides are enabled, use:

- **Build Command:** `npm run docs:build`
- **Output Directory:** `.vitepress/dist`
- **Install Command:** `npm ci` (or Vercel's detected npm install command)

Connect the GitHub repository and use `main` as the production branch. A push to that branch should start a production deployment; pull requests should receive preview deployments if enabled for the Vercel project. If the existing project still shows a 404 after the successful build, check its Root Directory and deployment logs first. This repository change does not connect an account, change Vercel project settings, or guarantee that an existing Vercel project is linked to the correct GitHub repository.

## Official references

- [VitePress getting started](https://vitepress.dev/guide/getting-started)
- [VitePress local search](https://vitepress.dev/reference/default-theme-search)
- [VitePress routing and rewrites](https://vitepress.dev/guide/routing)
- [VitePress site configuration](https://vitepress.dev/reference/site-config)
- [VitePress deployment guide](https://vitepress.dev/guide/deploy)
- [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build)
