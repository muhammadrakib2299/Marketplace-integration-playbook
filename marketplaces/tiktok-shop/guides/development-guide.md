# TikTok Shop Partner API development guide

**Coverage:** official-reference review only. No Partner Center app, token, sandbox, or production API call was used.

TikTok Shop's official developer guide describes a four-step path: onboard as a developer, create an app and enable scopes, authorize the relevant seller/creator/partner, then make the first signed API call. The correct path depends on the data owner and app category.

## Build sequence

1. **Onboard.** Create the Partner Center account and complete any market-specific compliance or legal review.
2. **Register the app.** Create the OAuth client, configure redirect URLs, and enable only the scopes required by the selected API families.
3. **Authorize.** Use the correct seller, creator, or partner entry domain. Validate `state`, exchange the one-time code, and store token metadata.
4. **Resolve context.** Retrieve the authorized shop or principal data required by the endpoint. Record market, region, `user_type`, granted scopes, and shop identifiers.
5. **Sign requests.** Follow the current Partner Center signing guide. Include the endpoint's required query parameters, timestamp, app key, token header, and any shop or category cipher required by that operation.
6. **Call one read endpoint.** Start with a low-risk list or detail operation, retain raw response and `request_id`, and validate scope and identifier behavior.
7. **Add writes behind controls.** Use explicit idempotency, audit logs, dry-run validation, and human review for product, fulfillment, cancellation, or refund actions.
8. **Add webhooks and reconciliation.** Subscribe only to necessary events; fetch authoritative state and run periodic repair jobs.

## Request hygiene

Never copy a request example into production without rechecking the endpoint's current version, base domain, method, path, required identifier, entity tag, scope, and signature rules. Keep tokens and app secrets server-side. Treat API version changes and changelog notices as release work, not as invisible dependency updates.

## Testing boundaries

TikTok Shop documents a Sandbox and API testing tool, but availability and data behavior depend on app and market eligibility. Test authorization, token refresh, signature handling, pagination, duplicate events, expired credentials, scope failures, and partial business outcomes. Record the environment, app, market, scopes, endpoint version, and test date; this repository contains no such account test.

## Official sources

- [TikTok Shop developer guide](https://partner.tiktokshop.com/docv2/page/656559fcf4488c02dfe8ce82)
- [TTS API overview](https://partner.tiktokshop.com/docv2/page/tts-api-concepts-overview)
- [Authorization overview](https://partner.tiktokshop.com/docv2/page/678e3a3292b0f40314a92d75)
- [Common errors](https://partner.tiktokshop.com/docv2/page/678e3a45786253031531b942)
- [API testing tool](https://partner.tiktokshop.com/dev/api-testing-tool)
