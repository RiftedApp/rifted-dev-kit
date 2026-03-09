import { PublicKey } from "@solana/web3.js";
import type { RiftProgramAddresses } from "./types";
import { u64LE } from "./utils";

export function getContestPda(contestProgramId: PublicKey, contestId: number): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("contest"), u64LE(BigInt(contestId))],
    contestProgramId
  )[0];
}

export function getContestVaultPda(contestProgramId: PublicKey, contestId: number): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("contest-vault"), u64LE(BigInt(contestId))],
    contestProgramId
  )[0];
}

export function getParticipantPda(
  contestProgramId: PublicKey,
  contestAddress: PublicKey,
  wallet: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("participant"), contestAddress.toBuffer(), wallet.toBuffer()],
    contestProgramId
  )[0];
}

export function getSubmissionPda(
  contestProgramId: PublicKey,
  contestAddress: PublicKey,
  participantAddress: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("submission"), contestAddress.toBuffer(), participantAddress.toBuffer()],
    contestProgramId
  )[0];
}

export function getReviewPda(
  contestProgramId: PublicKey,
  submissionAddress: PublicKey,
  reviewerParticipantAddress: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("review"), submissionAddress.toBuffer(), reviewerParticipantAddress.toBuffer()],
    contestProgramId
  )[0];
}

export function getTokenConfigPda(tokenProgramId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("token-config")], tokenProgramId)[0];
}

export function getTokenMintPda(tokenProgramId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("rift-mint")], tokenProgramId)[0];
}

export function deriveAllPdas(addresses: RiftProgramAddresses, contestId: number, wallet?: PublicKey) {
  const contest = getContestPda(addresses.contestProgramId, contestId);
  const contestVault = getContestVaultPda(addresses.contestProgramId, contestId);
  const participant = wallet
    ? getParticipantPda(addresses.contestProgramId, contest, wallet)
    : undefined;

  return {
    contest,
    contestVault,
    participant,
    tokenConfig: getTokenConfigPda(addresses.tokenProgramId),
    tokenMint: getTokenMintPda(addresses.tokenProgramId),
  };
}
