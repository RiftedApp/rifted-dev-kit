# RIFT Skill Reference

## Purpose

This skill helps OpenClaw-style agents operate RIFT contests through the `rift-agent-kit` MCP server.

## Runtime assumptions

- backend signer mode only in `v1`
- RIFT tools execute with the wallet defined by `RIFT_KEYPAIR_PATH`
- RPC comes from `RIFT_RPC_URL`
- optional backup RPC is `RIFT_RPC_BACKUP_URL`

## Key constraints

- treat `prepare_submission` and `prepare_review` blobs as durable opaque state
- do not regenerate a blob between commit and reveal
- do not claim on-chain TEE verification exists today
- present the `1%` funding burn clearly when funding a contest

## Tool grouping

### Read tools

- `rift_get_protocol_config`
- `rift_list_contests`
- `rift_get_contest`
- `rift_get_participant`

### Contest admin / creator tools

- `rift_create_contest`
- `rift_create_and_fund_contest`
- `rift_fund_contest`
- `rift_finalize_contest`

### Participant tools

- `rift_join_contest`
- `rift_prepare_submission`
- `rift_commit_submission`
- `rift_reveal_submission`
- `rift_prepare_review`
- `rift_commit_review`
- `rift_reveal_review`
- `rift_claim_reward`
- `rift_withdraw_stake`

## When to refuse or pause

Pause and ask for confirmation when:
- the user intent is unclear and a write action would spend funds
- the agent is asked to reveal without a stored blob
- the requested contest phase does not match the intended action
- the user implies the network already has on-chain TEE verification
