# Authorization API and token lifecycle

**Coverage:** official-reference review only. No app registration, authorization, token exchange, or API call was performed. The live [Authorization overview](https://partner.tiktokshop.com/docv2/page/678e3a3292b0f40314a92d75) remains authoritative for current fields and versions.

TikTok Shop authorization is OAuth-based, but the correct flow depends on who owns the data. Seller authorization, creator authorization, and partner/TAP authorization use different entry domains and produce different `user_type` values. Do not treat a partner token as a seller-shop token or reuse TikTok for Developers Login Kit assumptions.

## Authorization principals

| Principal | Typical use | `user_type` documented in the authorization guide |
|---|---|---:|
| Seller | In-house seller app or ISV serving authorized sellers | `0` |
| Creator | Creator-side affiliate integrations | `1` |
| Partner / TAP | Affiliate Partner or partner business data | `3` for the current partner type; `2` is legacy |
| Global Selling seller | Cross-border seller context | `4` or `5`, depending on the documented type |

The endpoint's entity tag and required scope still decide whether a token is valid. Always compare the endpoint reference with the token response's `user_type` and `granted_scopes`.

## Market-specific authorization links

The official guide documents separate domains. Seller authorization uses `services.us.tiktokshop.com/open/authorize` for the US and `services.tiktokshop.com/open/authorize` for ROW. Partner/TAP authorization uses the corresponding `partner.us.tiktokshop.com` or `partner.tiktokshop.com` host. Creator authorization uses the `shop.tiktok.com/alliance/creator/auth` flow. The app detail page provides the relevant `service_id` or `app_key`.

Add an unguessable, server-generated `state` value to the authorization request. Validate it once on the callback to reduce CSRF risk. Keep app secrets and tokens on the server; do not put them in browser bundles, logs, or client-side URLs.

## Token exchange

After approval, the redirect contains a temporary `code`. The official guide says the authorization code expires in 30 minutes and can be used only once. Exchange it immediately at:

```text
GET https://auth.tiktok-shops.com/api/v2/token/get
```

The documented parameters include `app_key`, `app_secret`, `auth_code`, and the exact grant type `authorized_code`. The token response includes `access_token`, expiration timestamps, `refresh_token`, `open_id`, seller context where applicable, `user_type`, and `granted_scopes`. Retain `request_id` for support diagnostics.

## Refresh

Refresh before access-token expiry at:

```text
GET https://auth.tiktok-shops.com/api/v2/token/refresh
```

Use `app_key`, `app_secret`, `refresh_token`, and the exact grant type `refresh_token`. Store the replacement token atomically so concurrent workers do not overwrite a newer credential with an older response.

## Safe implementation sequence

1. Register the app and enable only the scopes required by the intended API families.
2. Send the correct authorization link for the app's data owner and market.
3. Validate `state`, exchange the one-time code, and persist token metadata encrypted.
4. Record `user_type`, `granted_scopes`, seller base region, and authorization principal.
5. Resolve the authorized shop or required shop identifier before calling shop-scoped endpoints.
6. Sign requests using the current Partner Center signing guide and use the token header required by the endpoint.
7. Refresh before expiry and revoke or delete stored credentials when authorization is removed.

## Related official sources

- [Authorization overview](https://partner.tiktokshop.com/docv2/page/678e3a3292b0f40314a92d75)
- [TTS API overview](https://partner.tiktokshop.com/docv2/page/tts-api-concepts-overview)
- [Partner authorization guide](https://partner.tiktokshop.com/docv2/page/partner-authorization-guide)
- [Get authorized shops](https://partner.tiktokshop.com/docv2/page/get-authorized-shops-202309)
- [API scopes](https://partner.tiktokshop.com/docv2/page/access-scope)
