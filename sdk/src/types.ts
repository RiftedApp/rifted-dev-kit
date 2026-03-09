import type { Commitment, ConfirmOptions, Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";

export type ContestStatus = "Active" | "Finalized" | "Cancelled";
export type ContestPhase = "Commit" | "Reveal" | "Review" | "Ended" | "Finalized" | "Cancelled";
export type TokenAmountInput = bigint | number | string;

export interface RiftProgramAddresses {
  tokenProgramId: PublicKey;
  contestProgramId: PublicKey;
  tokenMint: PublicKey;
  protocolConfig: PublicKey;
}

export interface RiftSigner {
  publicKey: PublicKey;
  signTransaction(transaction: Transaction): Promise<Transaction> | Transaction;
}

export type RiftSignerLike = RiftSigner | Keypair;

export interface RiftClientConfig {
  connection: Connection;
  signer: RiftSignerLike;
  addresses?: Partial<RiftProgramAddresses>;
  commitment?: Commitment;
  confirmOptions?: ConfirmOptions;
}

export interface ContestParamsInput {
  duration: number;
  minStakeAmount: TokenAmountInput;
  maxParticipants: number;
  reviewCount: number;
  priceIncrementBps?: number;
  epsilonReward?: number;
  epsilonSlash?: number;
  alpha?: number;
  beta?: number;
  gamma?: number;
}

export interface ContestParamsResolved {
  duration: bigint;
  minStakeAmount: bigint;
  maxParticipants: number;
  reviewCount: number;
  priceIncrementBps: number;
  epsilonReward: bigint;
  epsilonSlash: bigint;
  alpha: bigint;
  beta: bigint;
  gamma: bigint;
}

export interface ContestMetadata {
  title: string;
  description: string;
  category: string;
  task: string;
  inputSpec: string;
  outputSpec: string;
  scoringMethod: string;
  reviewRules: string;
  tags?: string[];
  attestationRequirement?: "none" | "tee-planned";
  externalUrl?: string;
}

export interface CreateContestInput {
  metadataUri: string;
  metadata?: ContestMetadata;
  params: ContestParamsInput;
}

export interface CreateAndFundContestInput extends CreateContestInput {
  fundingAmount: TokenAmountInput;
}

export interface SubmissionCommitmentInput {
  resultData: string;
  attestation?: Uint8Array | Buffer;
  salt?: Uint8Array | Buffer;
}

export interface PreparedSubmission {
  resultData: string;
  attestation: Buffer;
  salt: Buffer;
  commitmentHash: Buffer;
}

export interface PreparedReview {
  score: number;
  salt: Buffer;
  commitmentHash: Buffer;
}

export interface ProtocolConfigAccount {
  authority: string;
  contestCount: number;
  totalStakeLocked: bigint;
  totalRewardsDistributed: bigint;
  paused: boolean;
  bump: number;
}

export interface ContestAccount {
  id: number;
  address: string;
  creator: string;
  tokenMint: string;
  metadataUri: string;
  startTime: number;
  duration: number;
  status: ContestStatus;
  phase: ContestPhase;
  rewardPool: bigint;
  participantCount: number;
  submissionCount: number;
  totalStaked: bigint;
  minStakeAmount: bigint;
  maxParticipants: number;
  reviewCount: number;
  currentJoinPrice: bigint;
  priceIncrementBps: number;
  epsilonReward: bigint;
  epsilonSlash: bigint;
  alpha: bigint;
  beta: bigint;
  gamma: bigint;
  paused: boolean;
  finalized: boolean;
  bump: number;
  vaultBump: number;
}

export interface ParticipantAccount {
  address: string;
  contest: string;
  wallet: string;
  stakedAmount: bigint;
  joinedAt: number;
  isActive: boolean;
  trustScore: bigint;
  reputation: bigint;
  totalRewards: bigint;
  rewardClaimed: boolean;
  isSlashed: boolean;
  bump: number;
}

export interface SubmissionAccount {
  address: string;
  contest: string;
  participant: string;
  commitmentHash: Buffer;
  committedAt: number;
  revealed: boolean;
  revealedAt: number;
  resultData: string;
  attestation: Buffer;
  aggregatedScore: bigint;
  reviewCount: number;
  bump: number;
}

export interface ReviewAccount {
  address: string;
  contest: string;
  submission: string;
  reviewer: string;
  commitmentHash: Buffer;
  committedAt: number;
  revealed: boolean;
  revealedAt: number;
  score: bigint;
  bump: number;
}

export interface FundingBreakdown {
  grossAmount: bigint;
  burnAmount: bigint;
  netAmount: bigint;
}

export interface CreateContestResult {
  contestId: number;
  contestAddress: string;
  signature: string;
}

export interface CreateAndFundContestResult {
  contestId: number;
  contestAddress: string;
  createSignature: string;
  fundSignature: string;
  funding: FundingBreakdown;
}
