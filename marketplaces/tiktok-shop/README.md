# TikTok Shop Partner API

**Status:** documented from official sources; no API calls or account tests have been performed. **Coverage:** one partner API reference, not a complete TikTok Shop integration.

This guide covers the `Get Authorized Category Assets` endpoint, version `202405`. It returns the business-category assets currently authorized by a partner for an app. Its category asset cipher is described as an input to related affiliate-partner APIs. The endpoint is not a seller-shop authorization check, and category access should not be treated as approval for unrelated APIs.

## Important platform distinction

TikTok for Developers and TikTok Shop Partner Center are separate documentation and access contexts. The [TikTok for Developers welcome page](https://developers.tiktok.com/docs/en/welcome) organizes product areas such as Login & Identity and Share to TikTok. Its APIs use user-granted scopes: TikTok says scope approval alone does not provide user data access; each user must authorize the app, and can grant only a subset of the requested scopes. [Scopes overview](https://developers.tiktok.com/doc/scopes-overview?enter_method=left_navigation)

The endpoint documented here is in the [TikTok Shop Partner Center](https://partner.tiktokshop.com/docv2/page/get-authorized-category-assets-202405). It requires the `partner.authorization.info` scope and a partner access token. Do not reuse assumptions about TikTok for Developers user tokens, scopes, or API hosts as if they applied to TikTok Shop Partner APIs.

## Guide map

- [Get Authorized Category Assets · 202405](apis/authorized-category-assets.md) — request requirements, permission boundary, and known unknowns.

## Access and regions

The API reference marks the target partner as **All** and requires `partner.authorization.info`. It says partner authorization is required before an app can access partner data, with access granted by business category. The request's `x-tts-access-token` must be the partner `access_token` from the [Get Access Token flow](https://partner.tiktokshop.com/docv2/page/678e3a3292b0f40314a92d75#Get%20Access%20Token%20API) with `user_type = 3`. See the official [Partner authorization guide](https://partner.tiktokshop.com/docv2/page/678e3a3978f4c20311b8b555).

The reference's category viewer asks developers to select a registration region and target market. This guide does not claim a complete region list or that an app/category is available in every market. Confirm the app's actual registration region, target market, and authorized categories in the Partner Center before building against them.

## Coverage and verification

Only the 202405 category-assets reference has been reviewed at operation level. The repository does not yet document product, order, inventory, fulfillment, or shop-authorization operations for TikTok Shop. No account authorization, token exchange, signing, sandbox, or production API request was tested. Follow the linked official docs for current schemas and access requirements.

**Last reviewed:** 2026-11-09.
