import { buildJoinContestIx, buildLeaveContestIx } from "./instructions";
import { getContestPda, getContestVaultPda, getParticipantPda } from "./pdas";
import { parseTokenAmount } from "./utils";
import type { RiftClient } from "./client";

export class RiftParticipantsClient {
  constructor(private readonly client: RiftClient) {}

  async join(contestId: number, stakeAmount: bigint | number | string): Promise<string> {
    const contest = getContestPda(this.client.addresses.contestProgramId, contestId);
    const contestVault = getContestVaultPda(this.client.addresses.contestProgramId, contestId);
    const participant = getParticipantPda(
      this.client.addresses.contestProgramId,
      contest,
      this.client.publicKey
    );
    const ix = buildJoinContestIx({
      addresses: this.client.addresses,
      user: this.client.publicKey,
      contest,
      participant,
      contestVault,
      stakeAmount: parseTokenAmount(stakeAmount),
    });

    return this.client.send([ix], "join contest");
  }

  async leave(contestId: number): Promise<string> {
    const contest = getContestPda(this.client.addresses.contestProgramId, contestId);
    const contestVault = getContestVaultPda(this.client.addresses.contestProgramId, contestId);
    const participant = getParticipantPda(
      this.client.addresses.contestProgramId,
      contest,
      this.client.publicKey
    );
    const ix = buildLeaveContestIx({
      addresses: this.client.addresses,
      user: this.client.publicKey,
      contest,
      participant,
      contestVault,
    });

    return this.client.send([ix], "leave contest");
  }
}
