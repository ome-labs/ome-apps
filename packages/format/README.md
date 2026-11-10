# @ome-labs/format

How Ome writes the numbers and words its screens show, written once for the desktop and the phone. Pure TypeScript
with no React and no platform code; data comes in as [`@ome-labs/api`](https://www.npmjs.com/package/@ome-labs/api)
types. The rules come from `ome/research/desktop/ui-guide.md` (§0 formatting rules and words, §5 page wording) and
the tones from the kit's pills (Figma page 31).

| Module      | Gives you                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `amount`    | `formatAmount` / `formatTokenAmount` (`250 OMET`) / `formatWithBaseUnits` for review screens; `parseAmount` for inputs, with `amountInputMessage` |
| `address`   | `shortHex` (`0x103b…c2c0`), `fullHex`, `isHex32`, `isHex16`                                                                                       |
| `count`     | `formatCount` (`1,182`) for block heights and gas                                                                                                 |
| `time`      | `timeAgo` (`2h ago`), `formatDuration` (`5h 12m`), `formatExpiry` (`expires in 5h 12m`), `formatAbsoluteTime`                                     |
| `threshold` | `approvalsLabel` (`2 of 3 approvals`), `toReadLabel` (`2 of 3 to read`), `voteProgress`                                                           |
| `status`    | label, meaning and tone for `ProposalStatus`, `ServiceStatus`, `StepStatus` and member connections                                                |
| `proposal`  | `shortProposalId` (`3eb2`), `proposalSummary` (`Transfer 250 OMET to dave (alias)`), `myVote`, `needsMyVote`                                      |
| `health`    | `readingHealth` (answering keepers, spare, can read) and `thresholdRisks` in the guide's exact words                                              |
| `review`    | `reviewChecks` in the CLI's order, `canApprove`, and the sponsored `feeLine`                                                                      |

`@ome-labs/format/sample` exports the guide's sample story (Alice, Bob and Carol; Treasury; OMET; proposals `3eb2`,
`335c`, `868c`) so tests and stories use the same data.

## Rules it keeps

- **Amounts never round.** Everything is `bigint`; display keeps every significant digit, and `parseAmount` refuses
  more decimals than the token has instead of dropping them.
- **No colours.** A status carries a `Tone` (`neutral`, `info`, `success`, `warning`, `danger`); the UI kits map tones
  to tokens.
- **No forbidden data.** There is no fiat, price, fee amount or ENS formatting here, because the guide forbids
  showing them. Fees have one line: "Sponsored, not paid by the vault."
- **Times take `now`.** Every relative time is computed from a `now` the caller passes, so one clock drives a screen.
