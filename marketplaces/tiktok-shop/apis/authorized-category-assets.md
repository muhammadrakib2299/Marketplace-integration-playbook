# Get Authorized Category Assets · 202405

**Coverage:** official-reference review only. No request was sent. This page summarizes the [TikTok Shop Partner Center reference](https://partner.tiktokshop.com/docv2/page/get-authorized-category-assets-202405), checked 2026-11-09.

## Purpose and boundary

This operation retrieves the business-category assets authorized by a partner for an app. TikTok says the returned category asset cipher can be used as an input to related affiliate-partner APIs. It is an app/partner category-permission check, not a list of seller-authorized shops and not proof that any other API surface is available.

| Attribute | Documented value |
|---|---|
| API | TikTok Shop Partner API — Authorization |
| Version | `202405` |
| Method and path | `GET /authorization/202405/category_assets` |
| Target partner | All |
| Required scope | `partner.authorization.info` |
| Access model | Partner access token; reference says `user_type = 3` |
| Region | Registration region and target market affect the app-category selection; full availability was not verified |
| Evidence | Official documentation review; not tested |

## Request requirements

The API reference lists these required headers:

- `content-type: application/json`
- `x-tts-access-token: <partner access_token>` — the reference directs developers to obtain this from the Get Access Token flow with `user_type = 3`.

The required query parameters are:

- `app_key` — the unique key assigned to the app.
- `sign` — a signature generated with TikTok Shop's signing algorithm.
- `timestamp` — Unix time in UTC.

The reference reviewed here does not identify a single universal regional base host or reproduce the complete signature algorithm. Select the appropriate official host and follow the current request-signing and common-parameter guidance linked from TikTok Shop's API reference rather than inventing or hard-coding them from this summary.

## Response and errors

The reference describes a response envelope with `code`, `message`, `request_id`, and `data`. It labels `data` as the specific return information but the reviewed page does not provide enough visible schema detail to safely reproduce a complete sample payload. The endpoint description identifies the category asset cipher as a useful value for affiliate-partner calls; confirm its exact response field and current shape in the live API reference.

The endpoint page lists no business-logic-specific error codes. That does not mean signing, authorization, common gateway, or transport errors cannot occur; consult TikTok Shop's [common errors](https://partner.tiktokshop.com/docv2/page/678e3a45786253031531b942) and standard response guidance.

## Safe integration sequence

1. Confirm the app, partner authorization, required `partner.authorization.info` permission, registration region, and target market in TikTok Shop Partner Center.
2. Obtain the correct partner access token through TikTok Shop's official [Get Access Token flow](https://partner.tiktokshop.com/docv2/page/678e3a3292b0f40314a92d75#Get%20Access%20Token%20API). Store credentials server-side; never put tokens or signatures in client-side code or public logs.
3. Construct the request using the app's own `app_key`, a current UTC timestamp, and a signature produced according to the current provider guide.
4. Parse the response envelope, retain `request_id` for support diagnostics, and treat category assets as the partner/app permission boundary described by TikTok.
5. Use the category asset cipher only where the corresponding affiliate-partner API documentation requires it. Independently verify seller/shop authorization before accessing shop data.

These are integration recommendations around the documented operation, not additional guarantees from TikTok.

## Related sources

- [TikTok Shop Partner API reference: Get Authorized Category Assets](https://partner.tiktokshop.com/docv2/page/get-authorized-category-assets-202405)
- [TikTok Shop Partner authorization guide](https://partner.tiktokshop.com/docv2/page/678e3a3978f4c20311b8b555)
- [TikTok for Developers: Scopes Overview](https://developers.tiktok.com/doc/scopes-overview?enter_method=left_navigation) — a separate developer ecosystem.
- [TikTok for Developers: Manage User Access Tokens](https://developers.tiktok.com/doc/login-kit-manage-user-access-tokens/) — separate Login Kit lifecycle guidance.
