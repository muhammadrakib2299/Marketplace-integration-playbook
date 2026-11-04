# Authentication: [marketplace]

> **API/version:** [version] · **Region:** [scope] · **Last checked:** YYYY-MM-DD

## Official sources

- Authentication reference URL — [version/region], checked YYYY-MM-DD.
- Application/access policy URL — checked YYYY-MM-DD.

## Access prerequisites

State seller eligibility, app registration/approval, partner requirements, account roles, supported regions, redirect URI rules, IP allowlists, certificates, and required scopes. Link each claim. Mark details not publicly verified as **Unverified**.

## Authorization flow

Describe the documented flow at a high level: app registration, seller consent, authorization callback, token exchange, API request, refresh, and revocation. Explain whether credentials are per application, seller, shop, region, or user. Record scopes and least-privilege implications. Avoid copying provider instructions verbatim.

## Request authentication

Document required headers, signing inputs/algorithm, canonicalization, timestamps/nonces, token placement, host/region selection, and clock-skew considerations only where supported by official documentation. Use placeholders in snippets such as `YOUR_ACCESS_TOKEN`; never provide real secrets or realistic live signatures.

## Expiration, rotation, and failure behavior

Explain access-token lifetime, refresh behavior, refresh-token rotation, reauthorization, revocation, and relevant error responses as documented. State what is unknown. Include safe handling for concurrent refreshes and credential rotation as general design guidance when provider behavior is unspecified.

## Secure handling checklist

- Store credentials in an approved secret manager, not source code or local config committed to version control.
- Apply least-privilege scopes and separate test credentials from production credentials.
- Redact authorization headers, signed requests, tokens, and seller identifiers from logs.
- Rotate and revoke credentials using the provider's documented mechanism.
- Do not share credentials, account screenshots, or private portal content in issues or pull requests.

## Verification record

| Claim | Evidence label | Source or authorized test | Checked |
|---|---|---|---|
| [claim] | Official / Tested / Unverified | [link or test summary] | YYYY-MM-DD |
