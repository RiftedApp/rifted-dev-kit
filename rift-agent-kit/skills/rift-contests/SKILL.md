---
name: rift-contests
description: Create and operate RIFT AI inference contests through the rift-agent-kit MCP tools. Use when the user wants to create contests, fund reward pools, join contests, submit model outputs, review submissions, finalize contests, or claim rewards on the RIFT protocol.
homepage: https://rifted.ai
user-invocable: true
trigger:
  - rift contest
  - create contest
  - fund contest
  - join contest
  - submit model output
  - review submission
  - finalize contest
  - claim reward
  - withdraw stake
tools:
  - mcp
version: 0.1.0
metadata:
  openclaw:
    requires:
      - node
      - RIFT_RPC_URL
      - RIFT_KEYPAIR_PATH
---

# RIFT Contests

Use this skill when working with the RIFT protocol through agent tools.

## Current network posture

RIFT is live on Solana, but current trust assumptions must be described honestly:
- `devnet`: dumbnet
- initial `mainnet`: dumbnet

Do not claim that processor verification or TEE attestation is enforced on-chain today.

## Tooling model

This skill assumes the agent has access to the `rift-agent-kit` MCP server, which exposes RIFT lifecycle tools.

Backend mode only for v1:
- actions execute with the backend signer configured by `RIFT_KEYPAIR_PATH`
- use read tools freely
- use write tools carefully and only when the user intent is explicit

## Lifecycle order

Follow this order unless the user asks for a narrower action:

1. `rift_get_protocol_config`
2. `rift_create_contest` or `rift_create_and_fund_contest`
3. `rift_fund_contest` if funding is separate
4. `rift_join_contest`
5. `rift_prepare_submission`
6. `rift_commit_submission`
7. wait for reveal phase
8. `rift_reveal_submission`
9. wait for review phase
10. `rift_prepare_review`
11. `rift_commit_review`
12. `rift_reveal_review`
13. wait for ended state
14. `rift_finalize_contest`
15. `rift_claim_reward`
16. `rift_withdraw_stake`

## Critical commit-reveal rule

When using:
- `rift_prepare_submission`
- `rift_prepare_review`

You must preserve the returned `blob` exactly and reuse it later for the matching reveal tool.

Treat the blob as opaque state. Do not regenerate it between commit and reveal.

## Contest creation rules

When creating or funding a contest:
- remind the user that funding burns `1%` on-chain
- present both gross funding and net reward pool if relevant
- use typed metadata whenever possible
- avoid empty or vague metadata

## Safety checks before writes

Before calling any write tool:
- confirm the intended `contestId`
- confirm the current phase with `rift_get_contest` when phase-sensitive
- confirm whether the backend signer should act for itself or for a specific operator workflow
- prefer `rift_create_and_fund_contest` over manually splitting create/fund unless the user explicitly wants separate steps
- do not use a reveal tool unless you still have the exact `blob` returned by the matching prepare step
- do not imply TEE verification or processor verification exists on-chain today

## Read-first workflow

If the user is exploring rather than writing:

1. `rift_get_protocol_config`
2. `rift_list_contests`
3. `rift_get_contest`
4. `rift_get_participant`

Only move to write tools once the user intent is explicit.

## Examples

### Create and fund

Use `rift_create_and_fund_contest` with:
- `metadataUri`
- optional typed `metadata`
- `params`
- `fundingAmount`

### Submission flow

1. call `rift_prepare_submission`
2. store the returned `blob`
3. call `rift_commit_submission`
4. later call `rift_reveal_submission` with the same `blob`

### Review flow

1. call `rift_prepare_review`
2. store the returned `blob`
3. call `rift_commit_review`
4. later call `rift_reveal_review` with the same `blob`

## Output style

When reporting results:
- include the relevant `contestId`
- include the transaction signature for each write action
- mention the contest phase when useful
- mention the net reward pool after funding if a burn occurred

## Additional resources

- For MCP setup and extraction guidance, see [reference.md](reference.md)
- For concrete tool usage examples, see [examples.md](examples.md)
