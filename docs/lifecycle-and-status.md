# Status and evidence lifecycle

Status describes the maturity of this repository's documentation, not a provider's commercial relationship or a production system's deployment status.

| Status | Meaning | Minimum expectation |
|---|---|---|
| `research` | Candidate to investigate; guide may be incomplete. | Candidate identity and at least one lead/source, clearly marked unverified. |
| `documented` | Core guide is present and key provider claims link to official sources. | Scope, access model, region, API surface/version where known, and verification date. |
| `tested` | Specific behavior was exercised in an authorized test environment. | State test environment, date, scenarios and limitations; retain `documented` quality. |
| `deprecated` | The documented API/version/approach is retired or should no longer be used. | Explain scope and date, link to provider notice and replacement if known. |
| `blocked` | Verification or documentation is blocked by access, permission, or unavailable information. | State the blocker without guessing; indicate what evidence is still needed. |

Evidence labels describe individual claims, not the whole folder:

- **Official:** directly supported by an official provider source. Include a link and check date.
- **Tested:** observed in an authorized test environment. State precisely what was exercised; do not generalize beyond it.
- **Unverified:** not confirmed against authoritative evidence. Keep visible and avoid wording it as fact.

A guide may contain a mixture of evidence types. Use `evidence: mixed` in the catalog when appropriate. A candidate from a spreadsheet or an employer's public marketing site can establish that a name is worth researching, but it does not establish public API availability or a completed integration.
