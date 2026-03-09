# `@rifted/sdk`

Opinionated TypeScript SDK for the RIFT contest protocol on Solana.

This SDK is designed for:
- Solana developers who want direct instruction builders and PDA helpers
- web2 / AI teams who want a higher-level API to create, fund, and operate contests

## Current trust model

RIFT is live on Solana, but the current network posture should be described as:
- `devnet`: dumbnet
- initial `mainnet`: dumbnet

The protocol already provides:
- on-chain contest lifecycle
- commit-reveal for submissions
- commit-reveal for reviews
- staking, rewards, refunds, finalization

The protocol does **not** yet verify TEE / processor attestations on-chain.

## What this SDK includes

- browser + server signer support
- typed contest metadata validation
- PDA derivation helpers
- keccak hashing aligned with the on-chain program
- high-level lifecycle methods
- low-level instruction builders
- query helpers for raw on-chain state

## Token economics

Funding a contest burns `1%` of the gross funding amount.

Example:
- creator funds `50,000 RIFT`
- protocol burns `500 RIFT`
- contest reward pool receives `49,500 RIFT`

## Install

```bash
npm install @rifted/sdk
```

## High-level example

```ts
import { Connection, Keypair, Transaction } from "@solana/web3.js";
import { RiftClient, type RiftSigner } from "@rifted/sdk";

const keypair = Keypair.generate();
const signer: RiftSigner = {
  publicKey: keypair.publicKey,
  signTransaction(transaction: Transaction) {
    transaction.partialSign(keypair);
    return transaction;
  },
};

const sdk = new RiftClient({
  connection: new Connection("https://api.devnet.solana.com", "confirmed"),
  signer,
});

const result = await sdk.contests.createAndFund({
  metadataUri: "https://rifted.ai/contests/music-gen",
  metadata: {
    title: "Music generation quality benchmark",
    description: "Evaluate model-generated music clips.",
    category: "music",
    task: "Generate 30 second clips",
    inputSpec: "Prompt string",
    outputSpec: "Audio URI",
    scoringMethod: "Peer review score from 0 to 1e6",
    reviewRules: "No self-review. Reviewers justify scores off-chain.",
    tags: ["music", "gen-ai"],
    attestationRequirement: "tee-planned",
  },
  params: {
    duration: 3600,
    minStakeAmount: "100",
    maxParticipants: 100,
    reviewCount: 3,
  },
  fundingAmount: "50000",
});
```

## Core modules

### `contests`
- `create()`
- `fund()`
- `createAndFund()`
- `finalize()`
- `cancel()`
- `estimateFunding()`

### `participants`
- `join()`
- `leave()`

### `submissions`
- `prepare()`
- `commit()`
- `reveal()`

### `reviews`
- `prepare()`
- `commit()`
- `reveal()`

### `rewards`
- `claim()`
- `withdrawStake()`
- `claimRefund()`

### `query`
- `getProtocolConfig()`
- `getContest()`
- `listContests()`
- `getContestPhase()`
- `getParticipant()`
- `listParticipants()`
- `getSubmission()`
- `getReview()`

## Metadata model

The protocol stores `metadataUri` on-chain. The SDK adds typed metadata validation for a better developer experience.

For `v1`, you should:
- prepare and host the metadata JSON yourself
- pass the final `metadataUri`
- optionally pass the typed metadata object for local validation

## Low-level builders

The SDK also exports:
- `buildCreateContestIx()`
- `buildFundRewardPoolIx()`
- `buildJoinContestIx()`
- `buildCommitSubmissionIx()`
- `buildRevealSubmissionIx()`
- `buildCommitReviewIx()`
- `buildRevealReviewIx()`
- `buildFinalizeContestIx()`
- `buildClaimRewardIx()`
- `buildWithdrawStakeIx()`

## Examples

See:
- `sdk/examples/server-create-and-fund.ts`
- `sdk/examples/browser-wallet.ts`
