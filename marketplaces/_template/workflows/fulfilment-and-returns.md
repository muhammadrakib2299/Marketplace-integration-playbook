# Workflow: fulfilment, tracking, and returns

> **API/version:** <version> · **Region:** <scope> · **Last checked:** YYYY-MM-DD

## Sources and evidence

- **Official:** [<provider fulfilment guide>](<url>) — checked YYYY-MM-DD.
- **Tested:** <authorized test and date, if any>.
- **Unverified:** <open questions>.

## Shipment creation and dispatch

Describe shipment/package resources, shipment identifiers, carrier/service constraints, label or manifest responsibilities, partial/split shipment support, required dispatch events, and relevant deadlines. Separate marketplace shipment APIs from carrier label APIs. Link official docs for each surface.

## Tracking updates

Document tracking number/carrier/service mapping, update timing, accepted formats, validation, dispatch confirmation, delivery events, and correction behavior. State how duplicate updates and asynchronous responses are handled.

## Cancellations, returns, and refunds

Explain when cancellation is allowed and how line-level/partial cases work. Describe return authorization, return receipt, refund initiation/confirmation, restocking, dispute evidence, and status sync only where supported by sources. Make clear which system owns the final state and financial action.

## Exceptions and reconciliation

Cover label failure, missing/invalid tracking, rejected shipment, lost event, split shipment, delivery exception, return without matching order, and partial refund. Document safe retry and reconciliation behavior, including manual review paths.

## Mapping

| Local field/state | Provider field/state | Direction | Transform | Evidence/source |
|---|---|---|---|---|
| <field/state> | <field/state> | <direction> | <rule> | <link and label> |

Protect personal information and never include real recipient addresses, order details, labels, tracking data, tokens, or private account IDs in this repository.
