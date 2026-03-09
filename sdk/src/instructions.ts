import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from "@solana/web3.js";
import type { ContestParamsResolved, RiftProgramAddresses } from "./types";
import { encodeBytes, encodeString, getInstructionDiscriminator, u16LE, u32LE, u64LE } from "./utils";

export function buildCreateContestIx(args: {
  addresses: RiftProgramAddresses;
  creator: PublicKey;
  contestId: number;
  contest: PublicKey;
  contestVault: PublicKey;
  metadataUri: string;
  params: ContestParamsResolved;
}): TransactionInstruction {
  const paramsData = Buffer.concat([
    encodeString(args.metadataUri),
    u64LE(args.params.duration),
    u64LE(args.params.minStakeAmount),
    u32LE(args.params.maxParticipants),
    Buffer.from([args.params.reviewCount]),
    u16LE(args.params.priceIncrementBps),
    u64LE(args.params.epsilonReward),
    u64LE(args.params.epsilonSlash),
    u64LE(args.params.alpha),
    u64LE(args.params.beta),
    u64LE(args.params.gamma),
  ]);

  return new TransactionInstruction({
    programId: args.addresses.contestProgramId,
    keys: [
      { pubkey: args.creator, isSigner: true, isWritable: true },
      { pubkey: args.addresses.protocolConfig, isSigner: false, isWritable: true },
      { pubkey: args.contest, isSigner: false, isWritable: true },
      { pubkey: args.contestVault, isSigner: false, isWritable: true },
      { pubkey: args.addresses.tokenMint, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([getInstructionDiscriminator("create_contest"), paramsData]),
  });
}

export function buildFundRewardPoolIx(args: {
  addresses: RiftProgramAddresses;
  funder: PublicKey;
  contest: PublicKey;
  contestVault: PublicKey;
  amount: bigint;
}): TransactionInstruction {
  const funderTokenAccount = getAssociatedTokenAddressSync(args.addresses.tokenMint, args.funder);
  return new TransactionInstruction({
    programId: args.addresses.contestProgramId,
    keys: [
      { pubkey: args.funder, isSigner: true, isWritable: true },
      { pubkey: args.contest, isSigner: false, isWritable: true },
      { pubkey: args.contestVault, isSigner: false, isWritable: true },
      { pubkey: funderTokenAccount, isSigner: false, isWritable: true },
      { pubkey: args.addresses.tokenMint, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([getInstructionDiscriminator("fund_reward_pool"), u64LE(args.amount)]),
  });
}

export function buildJoinContestIx(args: {
  addresses: RiftProgramAddresses;
  user: PublicKey;
  contest: PublicKey;
  participant: PublicKey;
  contestVault: PublicKey;
  stakeAmount: bigint;
}): TransactionInstruction {
  const userTokenAccount = getAssociatedTokenAddressSync(args.addresses.tokenMint, args.user);
  return new TransactionInstruction({
    programId: args.addresses.contestProgramId,
    keys: [
      { pubkey: args.user, isSigner: true, isWritable: true },
      { pubkey: args.contest, isSigner: false, isWritable: true },
      { pubkey: args.participant, isSigner: false, isWritable: true },
      { pubkey: args.contestVault, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: args.addresses.tokenMint, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([getInstructionDiscriminator("join_contest"), u64LE(args.stakeAmount)]),
  });
}

export function buildLeaveContestIx(args: {
  addresses: RiftProgramAddresses;
  user: PublicKey;
  contest: PublicKey;
  participant: PublicKey;
  contestVault: PublicKey;
}): TransactionInstruction {
  const userTokenAccount = getAssociatedTokenAddressSync(args.addresses.tokenMint, args.user);
  return new TransactionInstruction({
    programId: args.addresses.contestProgramId,
    keys: [
      { pubkey: args.user, isSigner: true, isWritable: true },
      { pubkey: args.contest, isSigner: false, isWritable: true },
      { pubkey: args.participant, isSigner: false, isWritable: true },
      { pubkey: args.contestVault, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: args.addresses.tokenMint, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: getInstructionDiscriminator("leave_contest"),
  });
}

export function buildCommitSubmissionIx(args: {
  addresses: RiftProgramAddresses;
  user: PublicKey;
  contest: PublicKey;
  participant: PublicKey;
  submission: PublicKey;
  commitmentHash: Buffer;
}): TransactionInstruction {
  return new TransactionInstruction({
    programId: args.addresses.contestProgramId,
    keys: [
      { pubkey: args.user, isSigner: true, isWritable: true },
      { pubkey: args.contest, isSigner: false, isWritable: true },
      { pubkey: args.participant, isSigner: false, isWritable: false },
      { pubkey: args.submission, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      getInstructionDiscriminator("commit_submission"),
      Buffer.from(args.commitmentHash),
    ]),
  });
}

export function buildRevealSubmissionIx(args: {
  addresses: RiftProgramAddresses;
  user: PublicKey;
  contest: PublicKey;
  participant: PublicKey;
  submission: PublicKey;
  resultData: string;
  attestation: Buffer;
  salt: Buffer;
}): TransactionInstruction {
  return new TransactionInstruction({
    programId: args.addresses.contestProgramId,
    keys: [
      { pubkey: args.user, isSigner: true, isWritable: true },
      { pubkey: args.contest, isSigner: false, isWritable: false },
      { pubkey: args.participant, isSigner: false, isWritable: false },
      { pubkey: args.submission, isSigner: false, isWritable: true },
    ],
    data: Buffer.concat([
      getInstructionDiscriminator("reveal_submission"),
      encodeString(args.resultData),
      encodeBytes(args.attestation),
      Buffer.from(args.salt),
    ]),
  });
}

export function buildCommitReviewIx(args: {
  addresses: RiftProgramAddresses;
  reviewer: PublicKey;
  contest: PublicKey;
  reviewerParticipant: PublicKey;
  submission: PublicKey;
  submissionParticipant: PublicKey;
  review: PublicKey;
  commitmentHash: Buffer;
}): TransactionInstruction {
  return new TransactionInstruction({
    programId: args.addresses.contestProgramId,
    keys: [
      { pubkey: args.reviewer, isSigner: true, isWritable: true },
      { pubkey: args.contest, isSigner: false, isWritable: false },
      { pubkey: args.reviewerParticipant, isSigner: false, isWritable: false },
      { pubkey: args.submission, isSigner: false, isWritable: false },
      { pubkey: args.submissionParticipant, isSigner: false, isWritable: false },
      { pubkey: args.review, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      getInstructionDiscriminator("commit_review"),
      Buffer.from(args.commitmentHash),
    ]),
  });
}

export function buildRevealReviewIx(args: {
  addresses: RiftProgramAddresses;
  reviewer: PublicKey;
  contest: PublicKey;
  reviewerParticipant: PublicKey;
  submission: PublicKey;
  review: PublicKey;
  score: number;
  salt: Buffer;
}): TransactionInstruction {
  return new TransactionInstruction({
    programId: args.addresses.contestProgramId,
    keys: [
      { pubkey: args.reviewer, isSigner: true, isWritable: true },
      { pubkey: args.contest, isSigner: false, isWritable: false },
      { pubkey: args.reviewerParticipant, isSigner: false, isWritable: false },
      { pubkey: args.submission, isSigner: false, isWritable: true },
      { pubkey: args.review, isSigner: false, isWritable: true },
    ],
    data: Buffer.concat([
      getInstructionDiscriminator("reveal_review"),
      u64LE(BigInt(args.score)),
      Buffer.from(args.salt),
    ]),
  });
}

export function buildFinalizeContestIx(args: {
  addresses: RiftProgramAddresses;
  authority: PublicKey;
  contest: PublicKey;
}): TransactionInstruction {
  return new TransactionInstruction({
    programId: args.addresses.contestProgramId,
    keys: [
      { pubkey: args.authority, isSigner: true, isWritable: false },
      { pubkey: args.contest, isSigner: false, isWritable: true },
    ],
    data: getInstructionDiscriminator("finalize_contest"),
  });
}

export function buildClaimRewardIx(args: {
  addresses: RiftProgramAddresses;
  user: PublicKey;
  contest: PublicKey;
  participant: PublicKey;
  submission: PublicKey;
  contestVault: PublicKey;
}): TransactionInstruction {
  const userTokenAccount = getAssociatedTokenAddressSync(args.addresses.tokenMint, args.user);
  return new TransactionInstruction({
    programId: args.addresses.contestProgramId,
    keys: [
      { pubkey: args.user, isSigner: true, isWritable: true },
      { pubkey: args.contest, isSigner: false, isWritable: true },
      { pubkey: args.participant, isSigner: false, isWritable: true },
      { pubkey: args.submission, isSigner: false, isWritable: false },
      { pubkey: args.contestVault, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: args.addresses.tokenMint, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: getInstructionDiscriminator("claim_reward"),
  });
}

export function buildWithdrawStakeIx(args: {
  addresses: RiftProgramAddresses;
  user: PublicKey;
  contest: PublicKey;
  participant: PublicKey;
  contestVault: PublicKey;
}): TransactionInstruction {
  const userTokenAccount = getAssociatedTokenAddressSync(args.addresses.tokenMint, args.user);
  return new TransactionInstruction({
    programId: args.addresses.contestProgramId,
    keys: [
      { pubkey: args.user, isSigner: true, isWritable: true },
      { pubkey: args.contest, isSigner: false, isWritable: false },
      { pubkey: args.participant, isSigner: false, isWritable: true },
      { pubkey: args.contestVault, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: args.addresses.tokenMint, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: getInstructionDiscriminator("withdraw_stake"),
  });
}

export function buildCancelContestIx(args: {
  addresses: RiftProgramAddresses;
  authority: PublicKey;
  contest: PublicKey;
}): TransactionInstruction {
  return new TransactionInstruction({
    programId: args.addresses.contestProgramId,
    keys: [
      { pubkey: args.authority, isSigner: true, isWritable: false },
      { pubkey: args.contest, isSigner: false, isWritable: true },
    ],
    data: getInstructionDiscriminator("cancel_contest"),
  });
}

export function buildClaimRefundIx(args: {
  addresses: RiftProgramAddresses;
  user: PublicKey;
  contest: PublicKey;
  participant: PublicKey;
  contestVault: PublicKey;
}): TransactionInstruction {
  const userTokenAccount = getAssociatedTokenAddressSync(args.addresses.tokenMint, args.user);
  return new TransactionInstruction({
    programId: args.addresses.contestProgramId,
    keys: [
      { pubkey: args.user, isSigner: true, isWritable: true },
      { pubkey: args.contest, isSigner: false, isWritable: false },
      { pubkey: args.participant, isSigner: false, isWritable: true },
      { pubkey: args.contestVault, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: args.addresses.tokenMint, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: getInstructionDiscriminator("claim_refund"),
  });
}
