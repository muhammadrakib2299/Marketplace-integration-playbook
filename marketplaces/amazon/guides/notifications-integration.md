# Amazon SP-API Notifications integration guide

**Documentation checked: 2026-11-06.** This guide describes the current Notifications API v1 contract and practical consumer patterns. Amazon documentation and the [OpenAPI model](https://github.com/amzn/selling-partner-api-models/tree/main/models/notifications-api-model) are authoritative for supported notification types, payload versions, filtering, and request fields; confirm them before deployment because they can change. [1] [2] [3]

## What the API does—and does not do

Notifications let an application subscribe to supported Amazon business events instead of polling continuously. Amazon supports **SQS** and **EventBridge** destination resources. A destination is not an arbitrary public HTTP endpoint: `createDestination` takes an SQS or EventBridge resource specification. If your app needs an HTTP webhook, route an event from your supported AWS destination to your service (for example, SQS consumer → your authenticated webhook, or EventBridge rule → supported AWS target/API destination where configured). That forwarding hop is your infrastructure, not an Amazon Notifications destination or direct Amazon-to-webhook contract. [1] [4] [5]

A sensible flow is:

```text
Amazon SP-API event
  → registered SQS queue OR EventBridge partner event source / bus
  → your queue consumer or EventBridge rule target
  → durable processing; optionally forward to your app's webhook
```

## Current API operations

The current published OpenAPI model lists these ten operations: [2]

| Operation | Purpose |
| --- | --- |
| `getSubscriptions` | List subscriptions for the requested notification type (the model limits `notificationTypes` to one per request); supports paging and optional payload-version filtering. |
| `getSubscription` | Retrieve subscription information by notification type and optional payload version. |
| `createSubscription` | Subscribe a notification type/payload version to a destination; optional processing directives depend on type. |
| `getSubscriptionById` | Retrieve one subscription by type and subscription ID. |
| `deleteSubscriptionById` | Delete a subscription by type and subscription ID. |
| `sendTestNotification` | Send a test notification for a subscription (check current model requirements and supported testing conditions). |
| `getDestinations` | List destinations for the application. |
| `createDestination` | Create an SQS or EventBridge destination. |
| `getDestination` | Retrieve a destination by ID. |
| `deleteDestination` | Delete a destination by ID. |

Treat deletion as a lifecycle action: first remove subscriptions that depend on a destination, verify the intended subscription state, then remove the destination when no longer needed. Keep destination and subscription IDs in configuration/state, and use the GET operations to reconcile actual Amazon-side state after provisioning or a failed deployment. Do not assume deleting an AWS queue or bus automatically removes the SP-API destination or subscriptions. The model is the source for exact request/response shapes. [2]

## Pick the destination and prepare it

### SQS

Use a **standard** SQS queue. SP-API does not support delivery to FIFO queues. Before registering it, grant the SP-API delivery principal permission to write to the queue following Amazon’s SQS setup tutorial. For server-side encryption, Amazon’s tutorial says the KMS key policy must also allow SP-API access; apply the documented policy narrowly in your environment and review AWS key-policy practices. Create the destination with the queue ARN and a developer-chosen name, then retain its returned `destinationId`. [4]

### EventBridge

Create an EventBridge destination in the AWS account and Region used for the setup. Amazon documents one EventBridge destination per AWS account. Use the returned `resource:eventBridge:name` to locate the partner event source in that account and Region, then associate that source with an event bus. Create a rule on that bus to select event types and route them to your chosen AWS target. Amazon’s tutorial also notes target permissions and calls out an encrypted SQS target’s KMS decrypt permission as a troubleshooting requirement. The AWS target is part of your delivery pipeline, separate from the SP-API destination. [5]

### Destination “verification”

Do not implement an invented webhook challenge/response flow. The documented SQS path relies on queue permissions (and KMS permissions if encrypted); the EventBridge path relies on locating and associating the partner event source. Verify setup operationally by reading back the destination with `getDestination`/`getDestinations`, validating AWS permissions and routing, and using `sendTestNotification` when its current operation documentation permits it. For EventBridge, Amazon explicitly suggests an SQS rule target as a way to verify events are arriving. These are configuration and delivery checks, not proof of a generic inbound HTTP endpoint. [2] [4] [5]

## Subscribe correctly

1. Choose a notification type from Amazon’s current [Notification Type Values](https://developer-docs.amazon.com/sp-api/docs/notification-type-values) page. Check the eligible party (seller, vendor, or both), payload version, destination workflow, marketplace/region constraints, and any required filter. The SQS and EventBridge tutorials support different sets; a type appearing in one workflow’s list does not imply it is available through the other. [3] [4] [5]
2. Authorize the relevant seller or vendor application relationship and ensure the SP-API application has the role associated with the notification type. Amazon’s role matrix lists `createSubscription` and `getSubscription` as requiring that type’s role. Destination management and subscription-by-ID operations are documented as grantless. Follow the current authorization guide and operation security definitions rather than treating the whole API as grantless. [1] [2]
3. Call `createSubscription` with the type in the path and body fields for `payloadVersion`, `destinationId`, and only the applicable optional `processingDirective`. Amazon allows multiple subscriptions for an application, notification type, and party when payload versions differ. Do not infer one subscription overwrites another. [1] [4] [5]
4. Read back state with `getSubscription`, `getSubscriptionById`, or `getSubscriptions`. The model says `getSubscriptions` can return all subscriptions for the caller’s party, supports pagination, and can filter on payload version. [2]
5. Keep subscription configuration per application, selling partner/party, notification type, payload version, destination, and relevant processing directive. Provision idempotently in your own deployment workflow: read state before creating, and reconcile after timeouts rather than blindly creating duplicates.

Notification type values are identifiers, not arbitrary strings. The values page currently includes (among others): `ACCOUNT_STATUS_CHANGED`, `ANY_OFFER_CHANGED`, `B2B_ANY_OFFER_CHANGED`, `BRANDED_ITEM_CONTENT_CHANGE`, `DETAIL_PAGE_TRAFFIC_EVENT`, `EXTERNAL_FULFILLMENT_SHIPMENT_STATUS_CHANGE`, `FBA_INVENTORY_AVAILABILITY_CHANGES`, `FBA_OUTBOUND_SHIPMENT_STATUS`, `FEED_PROCESSING_FINISHED`, `FEE_PROMOTION`, `FULFILLMENT_ORDER_STATUS`, `ITEM_INVENTORY_EVENT_CHANGE`, `ITEM_PRODUCT_TYPE_CHANGE`, `ITEM_SALES_EVENT_CHANGE`, `LISTINGS_ITEM_ISSUES_CHANGE`, `LISTINGS_ITEM_MFN_QUANTITY_CHANGE`, `LISTINGS_ITEM_STATUS_CHANGE`, `ORDER_CHANGE`, `PRICING_HEALTH`, `PRODUCT_TYPE_DEFINITIONS_CHANGE`, `REPORT_PROCESSING_FINISHED`, `SHIPMENT_TRACKING_MILESTONE_CHANGED`, `TAX_INVOICE_EXPORT_STATUS_CHANGE`, `TAX_INVOICE_ISSUANCE_ELIGIBILITY_STATUS_CHANGE`, `TAX_INVOICE_ISSUANCE_STATUS`, and `TRANSACTION_UPDATE`. The list above is illustrative, not a substitute for the official live catalog: use the catalog’s exact current spelling, availability, payload version, and workflow/type details when configuring. [3]

## Consume safely: duplicates, ordering, and queue handling

Amazon explicitly warns that SQS standard queue notifications can arrive more than once and out of order. It identifies `notificationMetadata.notificationId` as the duplicate-detection key. Design every handler to tolerate repeated and reordered events; do not use arrival order as business order. [4]

A robust consumer pattern is:

- Receive a message and parse/validate the envelope and expected payload version. Preserve the original message for diagnostics subject to your data-retention rules.
- Use a durable idempotency record keyed at minimum by application/subscription context plus `notificationMetadata.notificationId`. Claim/insert the key atomically with processing or persist a work record in the same transaction as state changes. If already completed, acknowledge/delete the queue message without repeating side effects. The key composition and transaction pattern here are implementation guidance, not an Amazon-required format.
- Perform work durably. Acknowledge/delete the SQS message only after durable success. On transient failures, allow retry using the queue’s visibility timeout/redrive setup; configure a dead-letter queue and alarms for exhausted/redriven work, then provide a controlled replay procedure. These are AWS consumer design recommendations, not Amazon-specific delivery guarantees or a documented SP-API retry schedule.
- Make state updates version-aware where payloads expose event times or entity versions. If the event is older than stored state, avoid regressing state; where ordering cannot be established, fetch the relevant current resource through the appropriate SP-API operation.
- Monitor queue age/depth, receive counts, consumer errors, DLQ depth, and subscription/destination state. Set visibility timeout and throughput to match actual handler duration and workload.

Amazon does not promise an end-to-end delivery time, a total ordering, or exactly-once processing in these docs. Treat events as signals to update or reconcile state, not as an ordered transaction log. Amazon recommends a backup means to retrieve needed information during unexpected delivery outages or delays. Implement periodic or gap-triggered retrieval through the relevant SP-API resources (for example, orders, inventory, listings, feeds or reports as applicable), using their own authorization, rate limits, and pagination. [1] [4]

EventBridge consumers should similarly design targets to handle retries/duplicate invocations according to the configured AWS service’s documented behavior. Configure target retry/DLQ capabilities where available and monitor failed invocations; do not apply SQS-specific `notificationId` claims to AWS delivery guarantees beyond Amazon’s stated message metadata behavior. [5]

## Payloads, filters, and privacy

Parse the notification envelope using the chosen `payloadVersion`; route by `notificationType`, `eventTime`, and `notificationMetadata` fields where present. Payload structure varies by type and version. Do not hard-code a single payload schema across notifications. Keep unknown fields tolerant, but reject or quarantine malformed messages and unsupported versions for review rather than silently dropping them. Sample payloads on Amazon’s type page are documentation examples, not evidence of guaranteed timing or ordering. [2] [3]

Processing directives are type-specific. Amazon documents `eventFilter` and CEL `filterExpression` options and says supported features vary by notification type. For example, its SQS guide limits `eventFilter` to specified types and notes unsupported use returns HTTP 400; it also documents that some filters cannot be combined. Consult the current filter guide and type page before sending a directive. [3] [4]

Treat payloads as potentially sensitive. The selected event can contain seller identifiers, listing, inventory, order, shipment, or business information depending on type. Limit queue, log, and DLQ access to the least privilege needed; avoid logging full payloads by default; encrypt and retain data according to your organization’s policy and applicable requirements. Amazon’s SQS instructions specifically document the queue write permission and optional SSE/KMS access requirements. Do not claim an additional Amazon-mandated signing header, webhook secret, or payload signature unless the relevant current Amazon documentation explicitly specifies it. [4]

## Test and release checklist

- Confirm exact type, party eligibility, payload version, delivery workflow, marketplace constraints, and role against the current type catalog.
- Create the queue or EventBridge resources and apply only required documented permissions; validate encryption policy if used.
- Create and read back the destination. For EventBridge, associate the correct partner source and confirm a rule routes to a test target.
- Create the subscription and read it back. Use `sendTestNotification` only under its documented prerequisites; verify its result is distinguishable from a real event in your test environment.
- Exercise duplicate delivery, out-of-order/late events, malformed/unknown-version payloads, transient downstream outage, consumer restart, poison message, DLQ redrive, and reconciliation.
- Confirm durable idempotency and ensure side effects are not repeated on replay.
- Alert on queue age/depth, DLQ, target delivery failures, consumer failures, and mismatches found by reconciliation.
- Document subscription/destination teardown and recovery procedures. Test recovery without assuming notifications will replay automatically after an outage.

## References

[1]: https://developer-docs.amazon.com/sp-api/docs/notifications-api-v1-use-case-guide "Notifications API v1 use-case guide"
[2]: https://github.com/amzn/selling-partner-api-models/tree/main/models/notifications-api-model "Selling Partner API Notifications model"
[3]: https://developer-docs.amazon.com/sp-api/docs/notification-type-values "Notification Type Values"
[4]: https://developer-docs.amazon.com/sp-api/docs/set-up-notifications-with-amazon-sqs "Set up notifications using the Amazon SQS workflow"
[5]: https://developer-docs.amazon.com/sp-api/docs/set-up-notifications-with-amazon-eventbridge "Set up notifications using the Amazon EventBridge workflow"
