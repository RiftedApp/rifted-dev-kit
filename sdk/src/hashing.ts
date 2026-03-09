import crypto from "crypto";
import { keccak_256 } from "js-sha3";
import type { PreparedReview, PreparedSubmission, SubmissionCommitmentInput } from "./types";

export function randomSalt(): Buffer {
  return crypto.randomBytes(32);
}

export function computeSubmissionHash(
  resultData: string,
  attestation: Buffer | Uint8Array,
  salt: Buffer | Uint8Array
): Buffer {
  return Buffer.from(
    keccak_256.arrayBuffer(
      Buffer.concat([Buffer.from(resultData, "utf8"), Buffer.from(attestation), Buffer.from(salt)])
    )
  );
}

export function computeReviewHash(score: number, salt: Buffer | Uint8Array): Buffer {
  const scoreBuffer = Buffer.alloc(8);
  scoreBuffer.writeBigUInt64LE(BigInt(score));
  return Buffer.from(
    keccak_256.arrayBuffer(Buffer.concat([scoreBuffer, Buffer.from(salt)]))
  );
}

export function prepareSubmissionCommitment(
  input: SubmissionCommitmentInput
): PreparedSubmission {
  const attestation = Buffer.from(input.attestation ?? Buffer.alloc(0));
  const salt = Buffer.from(input.salt ?? randomSalt());
  return {
    resultData: input.resultData,
    attestation,
    salt,
    commitmentHash: computeSubmissionHash(input.resultData, attestation, salt),
  };
}

export function prepareReviewCommitment(score: number, salt?: Buffer | Uint8Array): PreparedReview {
  const saltBuffer = Buffer.from(salt ?? randomSalt());
  return {
    score,
    salt: saltBuffer,
    commitmentHash: computeReviewHash(score, saltBuffer),
  };
}
