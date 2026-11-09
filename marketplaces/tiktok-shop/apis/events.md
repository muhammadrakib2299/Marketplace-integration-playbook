# Events API and operational reliability

**Coverage:** official-reference review only. No webhook subscription or delivery test was performed.

TikTok Shop supports webhooks for business events and provides an Events API for subscribing and unsubscribing Open Platform webhooks. The platform overview specifically calls out product and order status webhooks. Use webhooks to reduce detection latency, but fetch the current resource and reconcile because delivery can be delayed, duplicated, retried, or observed out of order.

## Consumer design

1. Verify the webhook request according to the current Partner Center webhook guide.
2. Persist the provider event identifier and raw payload before acknowledging.
3. Return success quickly and process business work asynchronously.
4. Deduplicate repeated deliveries and preserve event ordering metadata where available.
5. Fetch the current product or order detail when the event is actionable.
6. Reconcile local state and record the provider `request_id` or event identifier for support.

Subscribe only to events needed by the app's enabled scopes. A webhook subscription does not grant data access that the token or endpoint scope does not provide.

## Error and rate-limit handling

The official common-errors page recommends checking HTTP status, response `code`, `message`, and `request_id` together. Code `0` indicates successful processing. Handle HTTP 429 and `36009002` as rate limiting with bounded exponential backoff and `Retry-After` when present. Refresh expired credentials (`105002`), correct invalid signatures (`106001`), and resolve access-scope failures (`105005`) instead of retrying them indefinitely.

Common request-validation failures can reuse code `36009004`; branch on the message keyword as well as the numeric code. Timestamp values must remain within the documented acceptance window. Unexpected `shop_cipher`, invalid shop identifiers, unsupported API versions, and invalid authorization codes require correction rather than blind retry.

## Official sources

- [TTS webhooks overview](https://partner.tiktokshop.com/docv2/page/tts-webhooks-overview)
- [Get shop webhooks](https://partner.tiktokshop.com/docv2/page/get-shop-webhooks)
- [Common errors](https://partner.tiktokshop.com/docv2/page/678e3a45786253031531b942)
- [API versioning](https://partner.tiktokshop.com/docv2/page/api-versioning)
