import { buildCommitSubmissionIx, buildRevealSubmissionIx } from "./instructions";
import { prepareSubmissionCommitment } from "./hashing";
import { getContestPda, getParticipantPda, getSubmissionPda } from "./pdas";
import type { PreparedSubmission, SubmissionCommitmentInput } from "./types";
import type { RiftClient } from "./client";

export class RiftSubmissionsClient {
  constructor(private readonly client: RiftClient) {}

  prepare(input: SubmissionCommitmentInput): PreparedSubmission {
    return prepareSubmissionCommitment(input);
  }

  async commit(contestId: number, prepared: PreparedSubmission): Promise<string> {
    const contest = getContestPda(this.client.addresses.contestProgramId, contestId);
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

    const ix = buildCommitSubmissionIx({
      addresses: this.client.addresses,
      user: this.client.publicKey,
      contest,
      participant,
      submission,
      commitmentHash: prepared.commitmentHash,
    });

    return this.client.send([ix], "commit submission");
  }

  async reveal(contestId: number, prepared: PreparedSubmission): Promise<string> {
    const contest = getContestPda(this.client.addresses.contestProgramId, contestId);
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

    const ix = buildRevealSubmissionIx({
      addresses: this.client.addresses,
      user: this.client.publicKey,
      contest,
      participant,
      submission,
      resultData: prepared.resultData,
      attestation: prepared.attestation,
      salt: prepared.salt,
    });

    return this.client.send([ix], "reveal submission");
  }
}
