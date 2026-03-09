import { PublicKey } from "@solana/web3.js";
import {
  COMMIT_PHASE_RATIO,
  DEFAULT_ADDRESSES,
  REVEAL_PHASE_RATIO,
} from "./constants";
import { RiftAccountParseError } from "./errors";
import {
  getContestPda,
  getContestVaultPda,
  getParticipantPda,
  getReviewPda,
  getSubmissionPda,
} from "./pdas";
import type {
  ContestAccount,
  ContestPhase,
  ContestStatus,
  ParticipantAccount,
  ProtocolConfigAccount,
  ReviewAccount,
  RiftProgramAddresses,
  SubmissionAccount,
} from "./types";

function parseStatus(byte: number): ContestStatus {
  if (byte === 1) return "Finalized";
  if (byte === 2) return "Cancelled";
  return "Active";
}

export function getContestPhaseFromTimes(
  status: ContestStatus,
  startTime: number,
  duration: number,
  now = Math.floor(Date.now() / 1000)
): ContestPhase {
  if (status === "Finalized") return "Finalized";
  if (status === "Cancelled") return "Cancelled";
  const elapsed = now - startTime;
  const commitEnd = (duration * COMMIT_PHASE_RATIO) / 100;
  const revealEnd = commitEnd + (duration * REVEAL_PHASE_RATIO) / 100;

  if (elapsed < commitEnd) return "Commit";
  if (elapsed < revealEnd) return "Reveal";
  if (elapsed < duration) return "Review";
  return "Ended";
}

export function parseProtocolConfigAccount(data: Buffer): ProtocolConfigAccount {
  return {
    authority: new PublicKey(data.slice(8, 40)).toBase58(),
    contestCount: Number(data.readBigUInt64LE(40)),
    totalStakeLocked: data.readBigUInt64LE(48),
    totalRewardsDistributed: data.readBigUInt64LE(56),
    paused: data.readUInt8(64) === 1,
    bump: data.readUInt8(65),
  };
}

export function parseContestAccount(data: Buffer, address: PublicKey): ContestAccount {
  try {
    const id = Number(data.readBigUInt64LE(8));
    const creator = new PublicKey(data.slice(16, 48)).toBase58();
    const tokenMint = new PublicKey(data.slice(48, 80)).toBase58();
    const metadataLength = data.readUInt32LE(80);
    const metadataUri = data.slice(84, 84 + metadataLength).toString("utf8");
    let offset = 84 + metadataLength;
    const startTime = Number(data.readBigInt64LE(offset)); offset += 8;
    const duration = Number(data.readBigUInt64LE(offset)); offset += 8;
    const status = parseStatus(data.readUInt8(offset)); offset += 1;
    const rewardPool = data.readBigUInt64LE(offset); offset += 8;
    const participantCount = data.readUInt32LE(offset); offset += 4;
    const submissionCount = data.readUInt32LE(offset); offset += 4;
    const totalStaked = data.readBigUInt64LE(offset); offset += 8;
    const minStakeAmount = data.readBigUInt64LE(offset); offset += 8;
    const maxParticipants = data.readUInt32LE(offset); offset += 4;
    const reviewCount = data.readUInt8(offset); offset += 1;
    const currentJoinPrice = data.readBigUInt64LE(offset); offset += 8;
    const priceIncrementBps = data.readUInt16LE(offset); offset += 2;
    const epsilonReward = data.readBigUInt64LE(offset); offset += 8;
    const epsilonSlash = data.readBigUInt64LE(offset); offset += 8;
    const alpha = data.readBigUInt64LE(offset); offset += 8;
    const beta = data.readBigUInt64LE(offset); offset += 8;
    const gamma = data.readBigUInt64LE(offset); offset += 8;
    const paused = data.readUInt8(offset) === 1; offset += 1;
    const finalized = data.readUInt8(offset) === 1; offset += 1;
    const bump = data.readUInt8(offset); offset += 1;
    const vaultBump = data.readUInt8(offset);

    return {
      id,
      address: address.toBase58(),
      creator,
      tokenMint,
      metadataUri,
      startTime,
      duration,
      status,
      phase: getContestPhaseFromTimes(status, startTime, duration),
      rewardPool,
      participantCount,
      submissionCount,
      totalStaked,
      minStakeAmount,
      maxParticipants,
      reviewCount,
      currentJoinPrice,
      priceIncrementBps,
      epsilonReward,
      epsilonSlash,
      alpha,
      beta,
      gamma,
      paused,
      finalized,
      bump,
      vaultBump,
    };
  } catch (error) {
    throw new RiftAccountParseError(`Failed to parse contest ${address.toBase58()}: ${String(error)}`);
  }
}

export function parseParticipantAccount(data: Buffer, address: PublicKey): ParticipantAccount {
  try {
    if (data.length !== 115 && data.length !== 116) {
      throw new RiftAccountParseError(
        `Unexpected participant account size ${data.length} for ${address.toBase58()}`
      );
    }

    const isNewLayout = data.length >= 116;
    return {
      address: address.toBase58(),
      contest: new PublicKey(data.slice(8, 40)).toBase58(),
      wallet: new PublicKey(data.slice(40, 72)).toBase58(),
      stakedAmount: data.readBigUInt64LE(72),
      joinedAt: Number(data.readBigInt64LE(80)),
      isActive: data.readUInt8(88) === 1,
      trustScore: data.readBigUInt64LE(89),
      reputation: data.readBigInt64LE(97),
      totalRewards: data.readBigUInt64LE(105),
      rewardClaimed: isNewLayout ? data.readUInt8(113) === 1 : false,
      isSlashed: isNewLayout ? data.readUInt8(114) === 1 : data.readUInt8(113) === 1,
      bump: isNewLayout ? data.readUInt8(115) : data.readUInt8(114),
    };
  } catch (error) {
    throw new RiftAccountParseError(`Failed to parse participant ${address.toBase58()}: ${String(error)}`);
  }
}

export function parseSubmissionAccount(data: Buffer, address: PublicKey): SubmissionAccount {
  try {
    let offset = 8;
    const contest = new PublicKey(data.slice(offset, offset + 32)).toBase58(); offset += 32;
    const participant = new PublicKey(data.slice(offset, offset + 32)).toBase58(); offset += 32;
    const commitmentHash = Buffer.from(data.slice(offset, offset + 32)); offset += 32;
    const committedAt = Number(data.readBigInt64LE(offset)); offset += 8;
    const revealed = data.readUInt8(offset) === 1; offset += 1;
    const revealedAt = Number(data.readBigInt64LE(offset)); offset += 8;
    const resultDataLength = data.readUInt32LE(offset); offset += 4;
    const resultData = data.slice(offset, offset + resultDataLength).toString("utf8"); offset += resultDataLength;
    const attestationLength = data.readUInt32LE(offset); offset += 4;
    const attestation = Buffer.from(data.slice(offset, offset + attestationLength)); offset += attestationLength;
    const aggregatedScore = data.readBigUInt64LE(offset); offset += 8;
    const reviewCount = data.readUInt32LE(offset); offset += 4;
    const bump = data.readUInt8(offset);

    return {
      address: address.toBase58(),
      contest,
      participant,
      commitmentHash,
      committedAt,
      revealed,
      revealedAt,
      resultData,
      attestation,
      aggregatedScore,
      reviewCount,
      bump,
    };
  } catch (error) {
    throw new RiftAccountParseError(`Failed to parse submission ${address.toBase58()}: ${String(error)}`);
  }
}

export function parseReviewAccount(data: Buffer, address: PublicKey): ReviewAccount {
  try {
    let offset = 8;
    const contest = new PublicKey(data.slice(offset, offset + 32)).toBase58(); offset += 32;
    const submission = new PublicKey(data.slice(offset, offset + 32)).toBase58(); offset += 32;
    const reviewer = new PublicKey(data.slice(offset, offset + 32)).toBase58(); offset += 32;
    const commitmentHash = Buffer.from(data.slice(offset, offset + 32)); offset += 32;
    const committedAt = Number(data.readBigInt64LE(offset)); offset += 8;
    const revealed = data.readUInt8(offset) === 1; offset += 1;
    const revealedAt = Number(data.readBigInt64LE(offset)); offset += 8;
    const score = data.readBigUInt64LE(offset); offset += 8;
    const bump = data.readUInt8(offset);

    return {
      address: address.toBase58(),
      contest,
      submission,
      reviewer,
      commitmentHash,
      committedAt,
      revealed,
      revealedAt,
      score,
      bump,
    };
  } catch (error) {
    throw new RiftAccountParseError(`Failed to parse review ${address.toBase58()}: ${String(error)}`);
  }
}

export class RiftQueryClient {
  constructor(
    private readonly connection: import("@solana/web3.js").Connection,
    private readonly addresses: RiftProgramAddresses = DEFAULT_ADDRESSES
  ) {}

  async getProtocolConfig(): Promise<ProtocolConfigAccount> {
    const account = await this.connection.getAccountInfo(this.addresses.protocolConfig);
    if (!account) {
      throw new RiftAccountParseError("Protocol config account not found");
    }
    return parseProtocolConfigAccount(account.data);
  }

  async getContest(contestId: number): Promise<ContestAccount | null> {
    const contestAddress = getContestPda(this.addresses.contestProgramId, contestId);
    const account = await this.connection.getAccountInfo(contestAddress);
    if (!account) return null;
    return parseContestAccount(account.data, contestAddress);
  }

  async listContests(): Promise<ContestAccount[]> {
    const protocol = await this.getProtocolConfig();
    if (protocol.contestCount === 0) {
      return [];
    }

    const contests: ContestAccount[] = [];
    const batchSize = 50;
    for (let start = 1; start <= protocol.contestCount; start += batchSize) {
      const ids = Array.from(
        { length: Math.min(batchSize, protocol.contestCount - start + 1) },
        (_, index) => start + index
      );
      const addresses = ids.map((id) => getContestPda(this.addresses.contestProgramId, id));
      const accounts = await this.connection.getMultipleAccountsInfo(addresses);
      accounts.forEach((account, index) => {
        if (account) {
          contests.push(parseContestAccount(account.data, addresses[index]));
        }
      });
    }
    return contests.sort((left, right) => right.id - left.id);
  }

  async getContestPhase(contestId: number): Promise<ContestPhase | null> {
    const contest = await this.getContest(contestId);
    return contest?.phase ?? null;
  }

  async getParticipant(contestId: number, wallet: string | PublicKey): Promise<ParticipantAccount | null> {
    const contestAddress = getContestPda(this.addresses.contestProgramId, contestId);
    const participantAddress = getParticipantPda(
      this.addresses.contestProgramId,
      contestAddress,
      typeof wallet === "string" ? new PublicKey(wallet) : wallet
    );
    const account = await this.connection.getAccountInfo(participantAddress);
    if (!account) return null;
    return parseParticipantAccount(account.data, participantAddress);
  }

  async listParticipants(contestId: number): Promise<ParticipantAccount[]> {
    const contestAddress = getContestPda(this.addresses.contestProgramId, contestId);
    const accounts = await this.connection.getProgramAccounts(this.addresses.contestProgramId, {
      filters: [{ memcmp: { offset: 8, bytes: contestAddress.toBase58() } }],
    });
    return accounts
      .filter((account) => account.account.data.length === 115 || account.account.data.length === 116)
      .map((account) => parseParticipantAccount(account.account.data, account.pubkey));
  }

  async getSubmission(contestId: number, wallet: string | PublicKey): Promise<SubmissionAccount | null> {
    const contestAddress = getContestPda(this.addresses.contestProgramId, contestId);
    const participantAddress = getParticipantPda(
      this.addresses.contestProgramId,
      contestAddress,
      typeof wallet === "string" ? new PublicKey(wallet) : wallet
    );
    const submissionAddress = getSubmissionPda(
      this.addresses.contestProgramId,
      contestAddress,
      participantAddress
    );
    const account = await this.connection.getAccountInfo(submissionAddress);
    if (!account) return null;
    return parseSubmissionAccount(account.data, submissionAddress);
  }

  async getReview(
    contestId: number,
    submitterWallet: string | PublicKey,
    reviewerWallet: string | PublicKey
  ): Promise<ReviewAccount | null> {
    const contestAddress = getContestPda(this.addresses.contestProgramId, contestId);
    const submitterParticipant = getParticipantPda(
      this.addresses.contestProgramId,
      contestAddress,
      typeof submitterWallet === "string" ? new PublicKey(submitterWallet) : submitterWallet
    );
    const reviewerParticipant = getParticipantPda(
      this.addresses.contestProgramId,
      contestAddress,
      typeof reviewerWallet === "string" ? new PublicKey(reviewerWallet) : reviewerWallet
    );
    const submissionAddress = getSubmissionPda(
      this.addresses.contestProgramId,
      contestAddress,
      submitterParticipant
    );
    const reviewAddress = getReviewPda(
      this.addresses.contestProgramId,
      submissionAddress,
      reviewerParticipant
    );
    const account = await this.connection.getAccountInfo(reviewAddress);
    if (!account) return null;
    return parseReviewAccount(account.data, reviewAddress);
  }

  getContestAddress(contestId: number): PublicKey {
    return getContestPda(this.addresses.contestProgramId, contestId);
  }

  getContestVaultAddress(contestId: number): PublicKey {
    return getContestVaultPda(this.addresses.contestProgramId, contestId);
  }
}
