import { z } from "zod";

export const contestParamsSchema = z.object({
  duration: z.number().int().positive(),
  minStakeAmount: z.union([z.string(), z.number()]),
  maxParticipants: z.number().int().nonnegative(),
  reviewCount: z.number().int().min(1).max(10),
  priceIncrementBps: z.number().int().min(0).max(10_000).optional(),
  epsilonReward: z.number().int().nonnegative().optional(),
  epsilonSlash: z.number().int().nonnegative().optional(),
  alpha: z.number().int().nonnegative().optional(),
  beta: z.number().int().nonnegative().optional(),
  gamma: z.number().int().nonnegative().optional(),
});

export const metadataSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  task: z.string().min(1),
  inputSpec: z.string().min(1),
  outputSpec: z.string().min(1),
  scoringMethod: z.string().min(1),
  reviewRules: z.string().min(1),
  tags: z.array(z.string()).optional(),
  attestationRequirement: z.enum(["none", "tee-planned"]).optional(),
  externalUrl: z.string().url().optional(),
});

export const createAndFundContestSchema = z.object({
  metadataUri: z.string().min(1),
  metadata: metadataSchema.optional(),
  params: contestParamsSchema,
  fundingAmount: z.union([z.string(), z.number()]),
});

export const createContestSchema = z.object({
  metadataUri: z.string().min(1),
  metadata: metadataSchema.optional(),
  params: contestParamsSchema,
});

export const contestIdSchema = z.object({
  contestId: z.number().int().positive(),
});

export const fundContestSchema = z.object({
  contestId: z.number().int().positive(),
  fundingAmount: z.union([z.string(), z.number()]),
});

export const joinContestSchema = z.object({
  contestId: z.number().int().positive(),
  stakeAmount: z.union([z.string(), z.number()]),
});

export const prepareSubmissionSchema = z.object({
  resultData: z.string().min(1),
  attestation: z.string().optional().describe("UTF-8 attestation payload"),
});

export const commitSubmissionSchema = z.object({
  contestId: z.number().int().positive(),
  preparedSubmission: z.string().min(1).describe("Base64 JSON blob returned by prepare_submission"),
});

export const revealSubmissionSchema = commitSubmissionSchema;

export const prepareReviewSchema = z.object({
  score: z.number().int().min(0).max(1_000_000),
});

export const commitReviewSchema = z.object({
  contestId: z.number().int().positive(),
  submitterWallet: z.string().min(32),
  preparedReview: z.string().min(1).describe("Base64 JSON blob returned by prepare_review"),
});

export const revealReviewSchema = commitReviewSchema;

export const participantLookupSchema = z.object({
  contestId: z.number().int().positive(),
  wallet: z.string().min(32),
});
