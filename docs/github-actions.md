# GitHub Actions for documentation checks

The workflow in [`.github/workflows/docs-quality.yml`](../.github/workflows/docs-quality.yml) runs a Markdown linter and an external/local link checker. It runs for pull requests targeting `main`, pushes to `main`, manual dispatch, and once a week. The scheduled run helps catch links that go stale after a pull request has merged.

## Checks performed

`markdownlint-cli2` checks Markdown style and basic structure using [`.markdownlint-cli2.jsonc`](../.markdownlint-cli2.jsonc). The configuration keeps the normal rules but disables strict line-length and table-column-alignment rules, which can make long technical documentation harder to maintain. It does not automatically rewrite files.

`lychee` checks links in Markdown files, including relative links within the repository. It uses bounded concurrency, retries, and timeouts to reduce load on external documentation hosts. A broken or unreachable link fails the workflow so a contributor can review it. External sites can occasionally rate-limit or block automated requests; inspect the failing URL and logs before changing documentation. Do not broadly treat `403` or other errors as success just to make CI green. If an official source consistently blocks automated checks, document that limitation and add a narrow ignore rule only after manual verification.

The README's workflow-status badge is narrowly excluded in [`.lycheeignore`](../.lycheeignore) because GitHub can return 404 before the workflow has completed its first run or while a new workflow is still being introduced. This exception is limited to that generated badge URL; marketplace source links remain checked.

## Security and maintenance

The workflow grants only `contents: read` and uses GitHub-hosted runners. The external actions are pinned to full commit SHAs; comments identify the corresponding major version. [Dependabot](../.github/dependabot.yml) checks for GitHub Actions updates weekly. Review update pull requests and verify changed action sources before merging. Do not add secrets to this documentation workflow.

To require this check before merging, open **Settings → Rules → Rulesets** (or branch protection for `main`) and require the status check named **Validate Markdown and links**. This repository setting is not enforced by the workflow file itself.

## Run checks locally

Use Node.js and `npx` to run Markdown linting locally:

```sh
npx --yes markdownlint-cli2 "**/*.md" ".github/**/*.md" --config .markdownlint-cli2.jsonc
```

Install [lychee](https://github.com/lycheeverse/lychee) using its official installation instructions, then check the repository links:

```sh
lychee --no-progress --max-concurrency 8 --max-retries 2 --retry-wait-time 2 --timeout 30 --root-dir "$PWD" "./**/*.md" "./.github/**/*.md"
```

The workflow is the final authority for merge checks; local tools can differ in version or network access.
