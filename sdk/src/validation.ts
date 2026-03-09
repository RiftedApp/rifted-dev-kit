import { PRECISION_SCALE } from "./constants";
import { RiftValidationError } from "./errors";
import type { ContestParamsInput, ContestParamsResolved } from "./types";
import { parseTokenAmount } from "./utils";

export function resolveContestParams(input: ContestParamsInput): ContestParamsResolved {
  if (input.duration <= 0) {
    throw new RiftValidationError("Contest duration must be greater than zero");
  }

  if (input.maxParticipants < 0) {
    throw new RiftValidationError("maxParticipants cannot be negative");
  }

  if (input.reviewCount <= 0 || input.reviewCount > 10) {
    throw new RiftValidationError("reviewCount must be between 1 and 10");
  }

  const priceIncrementBps = input.priceIncrementBps ?? 0;
  if (priceIncrementBps < 0 || priceIncrementBps > 10_000) {
    throw new RiftValidationError("priceIncrementBps must be between 0 and 10000");
  }

  const resolved: ContestParamsResolved = {
    duration: BigInt(input.duration),
    minStakeAmount: parseTokenAmount(input.minStakeAmount),
    maxParticipants: input.maxParticipants,
    reviewCount: input.reviewCount,
    priceIncrementBps,
    epsilonReward: BigInt(input.epsilonReward ?? 100_000),
    epsilonSlash: BigInt(input.epsilonSlash ?? 200_000),
    alpha: BigInt(input.alpha ?? Number(PRECISION_SCALE)),
    beta: BigInt(input.beta ?? 300_000),
    gamma: BigInt(input.gamma ?? 200_000),
  };

  if (resolved.minStakeAmount <= 0n) {
    throw new RiftValidationError("minStakeAmount must be greater than zero");
  }

  return resolved;
}
