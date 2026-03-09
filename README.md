# Rifted Dev Kit

Public developer tooling for the RIFT protocol.

RIFT is building an on-chain contest engine for AI inference:
- create contests
- fund reward pools
- let participants stake and submit outputs
- run commit-reveal reviews
- finalize, reward, and withdraw on Solana

This repository contains the public developer layer around that protocol.

## What is inside

- `sdk/` — a TypeScript SDK for creating, funding, querying, and operating RIFT contests
- `rift-agent-kit/` — an MCP server, OpenClaw-compatible skill, and agent tooling built on top of the SDK

## Why this repo exists

Most teams exploring “AI x crypto” still need two things:
- a clean SDK for apps, bots, and backends
- a safe tool layer for autonomous agents

This repo gives you both.

## Packages

### `sdk`

Opinionated TypeScript SDK for the RIFT protocol.

Includes:
- browser + server support
- contest lifecycle methods
- query helpers
- typed metadata validation
- low-level instruction builders
- commit-reveal hashing aligned with the on-chain program

Read more in `sdk/README.md`.

### `rift-agent-kit`

Agent integration layer for RIFT.

Includes:
- backend-signer MCP server
- OpenClaw-compatible skill
- tools for contest creation, funding, querying, submission, review, finalization, and claims
- examples and extraction guidance

Read more in `rift-agent-kit/README.md`.

## Trust model

Current public positioning should stay explicit:
- `devnet`: dumbnet
- initial `mainnet`: dumbnet

The protocol supports real on-chain contest flows, but does not yet verify TEE / processor attestations on-chain.

## Quick start

### SDK

```bash
cd sdk
npm install
npm run build
```

### Agent kit

```bash
cd rift-agent-kit
npm install
npm run build
```

## Suggested entry points

- app developers: `sdk/README.md`
- agent builders: `rift-agent-kit/README.md`
- OpenClaw users: `rift-agent-kit/skills/rift-contests/SKILL.md`
