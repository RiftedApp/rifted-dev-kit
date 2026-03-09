# OpenClaw MCP Setup Example

This is an example of how a local OpenClaw-style agent runtime could launch the RIFT MCP server.

## Environment

```bash
export RIFT_RPC_URL=https://api.devnet.solana.com
export RIFT_KEYPAIR_PATH=$HOME/.config/solana/id.json
```

## Command

```bash
cd rift-agent-kit
npm run build
node dist/server.js
```

## Expected behavior

The agent can then discover tools such as:
- `rift_create_and_fund_contest`
- `rift_get_contest`
- `rift_prepare_submission`
- `rift_commit_submission`
- `rift_reveal_submission`

## Important note

This v1 uses a backend signer. Do not expose it publicly without proper key management, access controls, and environment isolation.
