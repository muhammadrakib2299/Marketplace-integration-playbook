# API schema validation

The documentation workflow validates checked-in OpenAPI and Swagger definitions automatically. It uses the pinned Redocly CLI and a minimal ruleset to catch invalid specifications and common contract issues without imposing a provider-specific style policy.

## Which files are checked

The validator recursively discovers JSON, YAML, and YML files whose filenames contain `openapi` or `swagger` as a distinct filename token. Examples include `openapi.yaml`, `swagger.json`, `amazon-openapi-v3.yaml`, and `orders.swagger.yml`. Keep provider schemas under the relevant `marketplaces/<slug>/` folder so they are easy to locate and maintain. The validator skips dependency, generated-site, coverage, and Git directories.

Only check in API definitions you are authorized to redistribute. Prefer linking to official hosted specifications when redistribution rights are unclear. Do not include credentials, live customer data, or production payloads.

## Run locally

Use the repository's supported Node.js version, install the lockfile dependencies, and run:

```sh
npm ci
npm run api:validate
```

If no matching spec files are present, the command succeeds with a clear “validation skipped” message. This keeps CI ready for future marketplace contributions without inventing or copying a provider schema into the repository.

## What this validates—and what it does not

The check parses each discovered document and validates it as an OpenAPI/Swagger definition using Redocly's minimal lint rules. It does not send requests to a provider, test authentication, validate production availability, prove that the spec matches a live service, or run contract tests against a marketplace sandbox. Those checks require authorized credentials, environment-specific setup, and explicit test fixtures; document them separately when they are introduced. A schema that passes lint still requires source/version review and appropriately authorized integration testing.

The validation runner is maintained in `scripts/validate-openapi.mjs`, and its npm dependency is pinned in `package.json` and `package-lock.json`.
