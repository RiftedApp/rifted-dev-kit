import { buildClaimRefundIx, buildClaimRewardIx, buildWithdrawStakeIx } from "./instructions";
import { getContestPda, getContestVaultPda, getParticipantPda, getSubmissionPda } from "./pdas";
import type { RiftClient } from "./client";

export class RiftRewardsClient {
  constructor(private readonly client: RiftClient) {}

  async claim(contestId: number): Promise<string> {
    const contest = getContestPda(this.client.addresses.contestProgramId, contestId);
    const contestVault = getContestVaultPda(this.client.addresses.contestProgramId, contestId);
    const participant = getParticipantPda(
      this.client.addresses.contestProgramId,
      contest,
      this.client.publicKey
    );
    const submission = getSubmissionPda(
      this.client.addresses.contestProgramId,
      contest,
      participant
    );

    const ix = buildClaimRewardIx({
      addresses: this.client.addresses,
      user: this.client.publicKey,
      contest,
      participant,
      submission,
      contestVault,
    });

    return this.client.send([ix], "claim reward");
  }

  async withdrawStake(contestId: number): Promise<string> {
    const contest = getContestPda(this.client.addresses.contestProgramId, contestId);
    const contestVault = getContestVaultPda(this.client.addresses.contestProgramId, contestId);
    const participant = getParticipantPda(
      this.client.addresses.contestProgramId,
      contest,
      this.client.publicKey
    );

    const ix = buildWithdrawStakeIx({
      addresses: this.client.addresses,
      user: this.client.publicKey,
      contest,
      participant,
      contestVault,
    });

    return this.client.send([ix], "withdraw stake");
  }

  async claimRefund(contestId: number): Promise<string> {
    const contest = getContestPda(this.client.addresses.contestProgramId, contestId);
    const contestVault = getContestVaultPda(this.client.addresses.contestProgramId, contestId);
    const participant = getParticipantPda(
      this.client.addresses.contestProgramId,
      contest,
      this.client.publicKey
    );
    const ix = buildClaimRefundIx({
      addresses: this.client.addresses,
      user: this.client.publicKey,
      contest,
      participant,
      contestVault,
    });
    return this.client.send([ix], "claim refund");
  }
}
