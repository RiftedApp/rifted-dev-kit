import { PublicKey } from "@solana/web3.js";
import { buildCommitReviewIx, buildRevealReviewIx } from "./instructions";
import { prepareReviewCommitment } from "./hashing";
import { getContestPda, getParticipantPda, getReviewPda, getSubmissionPda } from "./pdas";
import type { PreparedReview } from "./types";
import type { RiftClient } from "./client";

export class RiftReviewsClient {
  constructor(private readonly client: RiftClient) {}

  prepare(score: number, salt?: Buffer | Uint8Array): PreparedReview {
    return prepareReviewCommitment(score, salt);
  }

  async commit(
    contestId: number,
    submitterWallet: string | PublicKey,
    prepared: PreparedReview
  ): Promise<string> {
    const contest = getContestPda(this.client.addresses.contestProgramId, contestId);
    const reviewerParticipant = getParticipantPda(
      this.client.addresses.contestProgramId,
      contest,
      this.client.publicKey
    );
    const targetParticipant = getParticipantPda(
      this.client.addresses.contestProgramId,
      contest,
      typeof submitterWallet === "string" ? new PublicKey(submitterWallet) : submitterWallet
    );
    const submission = getSubmissionPda(
      this.client.addresses.contestProgramId,
      contest,
      targetParticipant
    );
    const review = getReviewPda(
      this.client.addresses.contestProgramId,
      submission,
      reviewerParticipant
    );

    const ix = buildCommitReviewIx({
      addresses: this.client.addresses,
      reviewer: this.client.publicKey,
      contest,
      reviewerParticipant,
      submission,
      submissionParticipant: targetParticipant,
      review,
      commitmentHash: prepared.commitmentHash,
    });

    return this.client.send([ix], "commit review");
  }

  async reveal(
    contestId: number,
    submitterWallet: string | PublicKey,
    prepared: PreparedReview
  ): Promise<string> {
    const contest = getContestPda(this.client.addresses.contestProgramId, contestId);
    const reviewerParticipant = getParticipantPda(
      this.client.addresses.contestProgramId,
      contest,
      this.client.publicKey
    );
    const targetParticipant = getParticipantPda(
      this.client.addresses.contestProgramId,
      contest,
      typeof submitterWallet === "string" ? new PublicKey(submitterWallet) : submitterWallet
    );
    const submission = getSubmissionPda(
      this.client.addresses.contestProgramId,
      contest,
      targetParticipant
    );
    const review = getReviewPda(
      this.client.addresses.contestProgramId,
      submission,
      reviewerParticipant
    );

    const ix = buildRevealReviewIx({
      addresses: this.client.addresses,
      reviewer: this.client.publicKey,
      contest,
      reviewerParticipant,
      submission,
      review,
      score: prepared.score,
      salt: prepared.salt,
    });

    return this.client.send([ix], "reveal review");
  }
}
