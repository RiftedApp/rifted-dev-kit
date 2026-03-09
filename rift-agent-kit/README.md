# rift-agent-kit

Agent toolkit for the RIFT protocol.

This package is designed to let agent frameworks such as OpenClaw use RIFT through:
- a backend signer-driven MCP server
- an OpenClaw-compatible skill
- the `@rifted/sdk` protocol layer underneath

## Status

Current trust model:
- `devnet`: dumbnet
- initial `mainnet`: dumbnet

What exists today:
- on-chain contest lifecycle
- staking
- reward pool funding with `1%` on-chain burn
- commit-reveal submissions
- commit-reveal reviews
- finalization, claim, withdraw

What does not exist on-chain yet:
- processor verification
- TEE attestation verification

## Architecture

```text
OpenClaw Skill / Agent Prompt
        |
        v
rift-agent-kit MCP server
        |
        v
@rifted/sdk
        |
        v
RIFT Solana programs
```

## Runtime model

`v1` runs in backend signer mode:
- signer wallet loaded from `RIFT_KEYPAIR_PATH`
- RPC loaded from `RIFT_RPC_URL`
- optional backup RPC loaded from `RIFT_RPC_BACKUP_URL`
- tools execute using that signer

Later, this can be extended for user wallet flows.

## Environment

Required:

```bash
export RIFT_RPC_URL=https://api.devnet.solana.com
export RIFT_RPC_BACKUP_URL=
export RIFT_RPC_WSS_URL=
export RIFT_KEYPAIR_PATH=$HOME/.config/solana/id.json
```

For mainnet preparation, copy:

```bash
cp .env.example .env.local
```

Then replace the values with your real mainnet RPC and final protocol addresses once they exist.

## Install

From this repo-local scaffold:

```bash
cd rift-agent-kit
npm install
npm run typecheck
```

## Run the MCP server

```bash
cd rift-agent-kit
npm run build
npm run start
```

This starts a stdio MCP server suitable for local tool-spawned integrations.

## Main tools

- `rift_get_protocol_config`
- `rift_list_contests`
- `rift_get_contest`
- `rift_create_contest`
- `rift_create_and_fund_contest`
- `rift_fund_contest`
- `rift_join_contest`
- `rift_prepare_submission`
- `rift_commit_submission`
- `rift_reveal_submission`
- `rift_prepare_review`
- `rift_commit_review`
- `rift_reveal_review`
- `rift_finalize_contest`
- `rift_claim_reward`
- `rift_withdraw_stake`
- `rift_get_participant`

## Commit-reveal behavior

Submission and review tools are split into:
- `prepare_*`
- `commit_*`
- `reveal_*`

The `prepare_*` tools return an opaque `blob`. Agents must preserve that blob and reuse it later for reveal. This is the minimum viable pattern for safe commit-reveal under agent orchestration.

## Funding burn

When a contest reward pool is funded:
- gross funding is sent by the funder
- `1%` is burned on-chain
- `99%` reaches the reward pool

Example:
- `1000 RIFT` gross
- `10 RIFT` burned
- `990 RIFT` net reward pool

## OpenClaw skill

The starter skill lives at:

- `skills/rift-contests/SKILL.md`

It is designed to:
- route agents toward the MCP tools
- preserve commit-reveal blobs
- keep the messaging honest about the current dumbnet trust model

## Extracting to a separate repo later

This scaffold lives inside the main repo for now. To extract it later:

1. copy `rift-agent-kit/` into a new repo
2. replace the local `@rifted/sdk` path strategy with the published package
3. publish MCP server and skill docs from the new repo
