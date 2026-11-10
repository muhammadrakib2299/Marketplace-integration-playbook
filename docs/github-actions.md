# GitHub Actions for documentation checks

The [GitHub Actions workflow](https://github.com/muhammadrakib2299/Marketplace-integration-playbook/blob/main/.github/workflows/docs-quality.yml) validates OpenAPI/Swagger definitions, runs the unit tests, builds the VitePress site, lints Markdown, and checks external and local links. It runs for pull requests targeting `main` or `dev`, pushes to `main` or `dev`, manual dispatch, and once a week. The scheduled run helps catch links that go stale after a pull request has merged.

## Checks performed

`npm test` runs the Node.js test suite in `tests/`. It covers the catalog generator (marketplace and guide validation, badge and route derivation, coverage counts, and missing-page detection), the directory's search, filter, and URL-state helpers, the page-context and display helpers, the site links that theme components use, and the design-token contrast checks. The site build runs the same generator, so a catalog entry or guide that links to a missing page also fails the **Build VitePress site** job.

`markdownlint-cli2` checks Markdown style and basic structure using the [`.markdownlint-cli2.jsonc` configuration](https://github.com/muhammadrakib2299/Marketplace-integration-playbook/blob/main/.markdownlint-cli2.jsonc). The configuration keeps the normal rules but disables strict line-length and table-column-alignment rules, which can make long technical documentation harder to maintain. It does not automatically rewrite files.

`lychee` checks links in Markdown files, including relative links within the repository. It uses bounded concurrency, retries, and timeouts to reduce load on external documentation hosts. A broken or unreachable link fails the workflow so a contributor can review it. External sites can occasionally rate-limit or block automated requests; inspect the failing URL and logs before changing documentation. Do not broadly treat `403` or other errors as success just to make CI green. If an official source consistently blocks automated checks, document that limitation and add a narrow ignore rule only after manual verification.

The README's workflow-status badge is narrowly excluded in the [`.lycheeignore` file](https://github.com/muhammadrakib2299/Marketplace-integration-playbook/blob/main/.lycheeignore) because GitHub can return 404 before the workflow has completed its first run or while a new workflow is still being introduced. This exception is limited to that generated badge URL; marketplace source links remain checked.

## Security and maintenance

The workflow grants only `contents: read` and uses GitHub-hosted runners. The external actions are pinned to full commit SHAs; comments identify the corresponding major version. The [Dependabot configuration](https://github.com/muhammadrakib2299/Marketplace-integration-playbook/blob/main/.github/dependabot.yml) checks for GitHub Actions updates weekly. Review update pull requests and verify changed action sources before merging. Do not add secrets to this documentation workflow.

To require this check before merging, open **Settings → Rules → Rulesets** (or branch protection for `main`) and require the status checks named **Validate Markdown and links**, **Run unit tests**, and **Build VitePress site**. This repository setting is not enforced by the workflow file itself.

## Run checks locally

Run the unit tests and the site build with:

```sh
npm test
npm run docs:build
```

Use Node.js and `npx` to run Markdown linting locally:

```sh
npx --yes markdownlint-cli2 "**/*.md" ".github/**/*.md" --config .markdownlint-cli2.jsonc
```

Install [lychee](https://github.com/lycheeverse/lychee) using its official installation instructions, then check the repository links:

```sh
lychee --no-progress --max-concurrency 8 --max-retries 2 --retry-wait-time 2 --timeout 30 --root-dir "$PWD" "./**/*.md" "./.github/**/*.md"
```

The workflow is the final authority for merge checks; local tools can differ in version or network access.
