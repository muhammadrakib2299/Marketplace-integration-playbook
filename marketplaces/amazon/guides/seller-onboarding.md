# Connect an Amazon seller account

This guide describes the developer journey from app setup to a verified seller connection. It covers seller apps only. Amazon has different onboarding paths for private apps, public apps, and service providers; select the official path that matches the product before building the UI.

| Status | Meaning |
|---|---|
| Documentation status | Official-source review only; no account or sandbox test performed |
| Reviewed | 2026-11-05 |
| Scope | Developer onboarding, seller consent, token exchange, connection verification |

## Before connecting a seller

1. **Choose app and business model.** A private app is for the developer's own organization; a public app serves other selling partners. Public apps and service providers have additional registration, role, security, or publication steps.
2. **Define every use case and operation.** Use Amazon's [role mappings](https://developer-docs.amazon.com/sp-api/docs/role-mappings) to request only the roles required. Seller consent alone does not grant every API permission.
3. **Complete Amazon registration.** Follow the official [developer onboarding sequence](https://developer-docs.amazon.com/sp-api/docs/onboarding-overview): developer profile, sandbox app/call, authorization workflow, production app/call, tests, and app listing if applicable. Amazon does not promise a universal approval or setup duration.
4. **Configure secure OAuth endpoints.** Register the redirect URI in the app. Generate a unique short-lived `state` per seller attempt, validate it on callback, and do not put long-lived tokens in the browser.
5. **Plan region and marketplace separately.** SP-API host is selected by selling region; marketplace IDs identify individual Amazon stores. See [endpoints](https://developer-docs.amazon.com/sp-api/docs/sp-api-endpoints) and [marketplace IDs](https://developer-docs.amazon.com/sp-api/docs/marketplace-ids).

## Public app: seller connection journey

1. In your product, the seller selects **Connect Amazon**. Create a pending connection record and a cryptographically random `state`, bound to the signed-in tenant/user and expiring soon.
2. Redirect the seller to the appropriate regional Seller Central authorization URL for the registered application, including the Amazon application ID and the state required by the selected authorization flow. Follow the exact URL format and callback mechanics in Amazon's [Website Authorization Workflow](https://developer-docs.amazon.com/sp-api/docs/website-authorization-workflow) or [Appstore Authorization Workflow](https://developer-docs.amazon.com/sp-api/docs/selling-partner-appstore-authorization-workflow); do not mix flow variants.
3. After seller consent, Amazon sends the browser to the registered redirect URI with `state`, `selling_partner_id`, and `spapi_oauth_code`. Match and consume the stored state exactly once. Reject missing, expired, replayed, or mismatched state.
4. Exchange the authorization code for a refresh token promptly. Amazon says the code expires after five minutes; it also warns that a website authorization flow taking longer than ten minutes may need to be restarted.
5. Store the refresh token encrypted in server-side secret storage, scoped to the application and seller connection. Redact authorization codes, refresh/access tokens, client secrets, and callback query strings from logs and analytics.
6. Exchange the refresh token for a short-lived LWA access token when making an API request. Amazon says the access token typically expires after one hour. Keep token refresh behind a backend service; never ship app secrets or refresh tokens to a browser/mobile client.
7. Resolve and persist the seller's authorized marketplaces and corresponding SP-API regional endpoint. Do not infer store coverage from the seller ID or a single consent action.
8. Make a low-risk request the app is authorized to make for that seller and selected region. Mark the connection **Connected** only after callback validation, successful token exchange, and a successful authorized API response. Save safe metadata such as seller ID, region, marketplace IDs, granted capability set, and verification timestamp—not token material in ordinary application tables/logs.
9. If the seller revokes access or token/API calls indicate authorization has ended, stop retries, mark the connection **Needs reconnect**, preserve only data allowed by the product's retention policy, and provide a reauthorization path. Amazon's [revocation guidance](https://developer-docs.amazon.com/sp-api/docs/revoke-authorizations) describes seller-side revocation.

## Private app path

A private application is self-authorized by the organization that owns the app. Use Amazon's [self-authorization instructions](https://developer-docs.amazon.com/sp-api/docs/self-authorization), store the resulting credential securely, and do not present that path as a general public-seller consent flow. Private-app authorization limits and public-app authorization limits differ; confirm the live [authorization limits](https://developer-docs.amazon.com/sp-api/docs/application-authorization-limits).

## What “successfully connected” means in the UI

Show a staged connection status rather than a single optimistic green check:

- **Not connected:** no completed authorization.
- **Waiting for Amazon:** seller is at Amazon consent.
- **Verifying:** callback state passed; server is exchanging credentials and checking the selected region/roles.
- **Connected:** at least one authorized API request succeeded; show verified seller and marketplace scope, last check time, and enabled capabilities.
- **Action required:** consent revoked, app role missing, authorization expired/invalid, or a required marketplace is unavailable. Explain the next safe action without exposing internal error detail or secrets.

Do not claim the seller account is fully connected just because Amazon redirected back or because the token exchange returned successfully. A token does not prove that the app has the roles needed for every later workflow.

## Node/NestJS backend outline

Use the official Amazon flow and an SP-API-compatible client/SDK or request-signing implementation. The sketch below is pseudocode for separation of responsibilities, not a drop-in SP-API SDK.

```ts
// Controller: public callback contains secrets in query parameters.
// Configure request logging/proxy/access logs to redact the full callback URL.
@Get('amazon/callback')
async callback(@Query() query: AmazonOAuthCallback) {
  const attempt = await this.oauthState.consumeOnce(query.state);
  if (!attempt || attempt.expiresAt < new Date()) {
    throw new BadRequestException('Authorization attempt expired. Start again.');
  }

  const tokenSet = await this.amazonOAuth.exchangeAuthorizationCode({
    code: query.spapi_oauth_code,
    redirectUri: attempt.redirectUri,
  });

  await this.connections.storeEncrypted({
    tenantId: attempt.tenantId,
    sellingPartnerId: query.selling_partner_id,
    refreshToken: tokenSet.refresh_token,
    status: 'verifying',
  });

  // Use the correct Amazon regional host and an operation allowed by app roles.
  const verified = await this.amazonProbe.verifyConnection(query.selling_partner_id);
  await this.connections.markConnected(verified.safeMetadata);
  return this.redirectToApp('/settings/channels/amazon?connected=1');
}
```

Do not log the request URL/query, DTO, authorization code, or token response. In NestJS, use a dedicated OAuth service, token-vault interface, connection repository, and SP-API client provider; keep OAuth state server-side, one-use, and tenant-bound.

## Python backend outline

The callback handler should perform the same validation and secret-handling sequence. This snippet only illustrates exchanging the short-lived authorization code at the LWA token endpoint; the seller consent URL must match the Amazon flow registered for the app.

```python
import os
import requests

LWA_TOKEN_URL = "https://api.amazon.com/auth/o2/token"

def exchange_code(code: str, redirect_uri: str) -> dict:
    response = requests.post(
        LWA_TOKEN_URL,
        data={
            "grant_type": "authorization_code",
            "code": code,
            "client_id": os.environ["LWA_CLIENT_ID"],
            "client_secret": os.environ["LWA_CLIENT_SECRET"],
            "redirect_uri": redirect_uri,
        },
        timeout=15,
    )
    response.raise_for_status()
    return response.json()  # keep in memory; encrypt refresh_token before persistence
```

This does **not** make an SP-API request. For API calls, follow Amazon's [connection guide](https://developer-docs.amazon.com/sp-api/docs/connecting-to-the-selling-partner-api), request signing/call structure, role requirements, region host, `x-amz-access-token`, date and user-agent requirements. Prefer a maintained client library or carefully tested signing layer; do not paste unsigned `requests.get()` examples into production.

## Timings, caps, and failure conditions

- OAuth authorization code: **five-minute expiry**. Exchange promptly.
- Entire website authorization flow: Amazon says a flow longer than **ten minutes may break** and may need restarting.
- LWA access token: typically **one hour**. Refresh-token lifetime and revocation propagation should not be guessed from this.
- Authorization caps vary by app type and publication state; see Amazon's current [authorization-limit table](https://developer-docs.amazon.com/sp-api/docs/application-authorization-limits).
- Amazon publishes no universal duration for developer approval, role review, app publication, or seller onboarding.
- Common failure classes: seller cancellation; wrong/missing OAuth state; expired authorization code; redirect URI mismatch; invalid app credentials; revoked seller authorization; missing API role; incorrect regional endpoint or marketplace ID; throttling; transient server/network failure.

Retry transient service/network failures with bounded backoff. Do not loop on seller cancellation, invalid state, role denial, or schema/business errors. For exact operation quotas, use the operation reference and Amazon's [rate-limit guidance](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits).

## Official references

- [Developer onboarding](https://developer-docs.amazon.com/sp-api/docs/onboarding-overview)
- [Public app authorization](https://developer-docs.amazon.com/sp-api/docs/authorize-public-applications)
- [Website authorization workflow](https://developer-docs.amazon.com/sp-api/docs/website-authorization-workflow)
- [Appstore authorization workflow](https://developer-docs.amazon.com/sp-api/docs/selling-partner-appstore-authorization-workflow)
- [Private app self-authorization](https://developer-docs.amazon.com/sp-api/docs/self-authorization)
- [Connect to SP-API](https://developer-docs.amazon.com/sp-api/docs/connecting-to-the-selling-partner-api)
- [Role mappings](https://developer-docs.amazon.com/sp-api/docs/role-mappings)
- [Endpoints](https://developer-docs.amazon.com/sp-api/docs/sp-api-endpoints)
- [Marketplace IDs](https://developer-docs.amazon.com/sp-api/docs/marketplace-ids)
- [Authorization limits](https://developer-docs.amazon.com/sp-api/docs/application-authorization-limits)
- [Revocation](https://developer-docs.amazon.com/sp-api/docs/revoke-authorizations)
- [Python SDK tutorial](https://developer-docs.amazon.com/sp-api/docs/tutorial-automate-your-sp-api-calls-using-python-sdk)
- [JavaScript/Node.js SDK tutorial](https://developer-docs.amazon.com/sp-api/docs/tutorial-automate-your-sp-api-calls-using-javascript-sdk-for-node-js)
