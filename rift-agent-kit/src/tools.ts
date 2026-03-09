import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createBackendRiftClient } from "./config";

function encodeAgentBlob(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64");
}

function decodeAgentBlob<T>(blob: string): T {
  return JSON.parse(Buffer.from(blob, "base64").toString("utf8")) as T;
}

export interface SerializedPreparedSubmission {
  resultData: string;
  attestationBase64: string;
  saltBase64: string;
  commitmentHashHex: string;
}

export interface SerializedPreparedReview {
  score: number;
  saltBase64: string;
  commitmentHashHex: string;
}

export function registerRiftTools(server: McpServer) {
  const z = require("zod") as typeof import("zod");
  const schemas = require("./types") as typeof import("./types");

  const asStructuredContent = (value: unknown): Record<string, unknown> | undefined => {
    if (value === undefined) {
      return undefined;
    }

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return { value };
  };

  const text = (message: string, structuredContent?: unknown) => ({
    content: [{ type: "text" as const, text: message }],
    structuredContent: asStructuredContent(structuredContent),
  });

  server.registerTool(
    "rift_get_protocol_config",
    {
      title: "Get RIFT protocol config",
      description: "Read the current protocol configuration and global contest counters from Solana.",
      inputSchema: z.object({}),
    },
    async () => {
      const sdk = createBackendRiftClient();
      const protocol = await sdk.query.getProtocolConfig();
      return text(JSON.stringify(protocol, null, 2), protocol);
    }
  );

  server.registerTool(
    "rift_list_contests",
    {
      title: "List RIFT contests",
      description: "List contests from the RIFT protocol directly from on-chain data.",
      inputSchema: z.object({}),
    },
    async () => {
      const sdk = createBackendRiftClient();
      const contests = await sdk.query.listContests();
      return text(JSON.stringify(contests, null, 2), contests);
    }
  );

  server.registerTool(
    "rift_get_contest",
    {
      title: "Get a RIFT contest",
      description: "Fetch a single contest by contestId and return status, phase, reward pool, and counters.",
      inputSchema: schemas.contestIdSchema,
    },
    async ({ contestId }) => {
      const sdk = createBackendRiftClient();
      const contest = await sdk.query.getContest(contestId);
      return text(JSON.stringify(contest, null, 2), contest);
    }
  );

  server.registerTool(
    "rift_create_contest",
    {
      title: "Create a RIFT contest",
      description: "Create a contest on RIFT without funding it yet.",
      inputSchema: schemas.createContestSchema,
    },
    async (input) => {
      const sdk = createBackendRiftClient();
      const result = await sdk.contests.create(input);
      return text(JSON.stringify(result, null, 2), result);
    }
  );

  server.registerTool(
    "rift_create_and_fund_contest",
    {
      title: "Create and fund a RIFT contest",
      description: "Create a new RIFT contest and fund its reward pool. Funding burns 1% on-chain.",
      inputSchema: schemas.createAndFundContestSchema,
    },
    async (input) => {
      const sdk = createBackendRiftClient();
      const result = await sdk.contests.createAndFund(input);
      return text(JSON.stringify(result, null, 2), result);
    }
  );

  server.registerTool(
    "rift_fund_contest",
    {
      title: "Fund a RIFT contest",
      description: "Fund an existing contest reward pool. The protocol burns 1% of the gross amount on-chain.",
      inputSchema: schemas.fundContestSchema,
    },
    async ({ contestId, fundingAmount }) => {
      const sdk = createBackendRiftClient();
      const result = await sdk.contests.fund(contestId, fundingAmount);
      return text(JSON.stringify(result, null, 2), result);
    }
  );

  server.registerTool(
    "rift_join_contest",
    {
      title: "Join a RIFT contest",
      description: "Join a contest as the backend signer wallet by staking RIFT.",
      inputSchema: schemas.joinContestSchema,
    },
    async ({ contestId, stakeAmount }) => {
      const sdk = createBackendRiftClient();
      const signature = await sdk.participants.join(contestId, stakeAmount);
      return text(signature, { signature, contestId });
    }
  );

  server.registerTool(
    "rift_prepare_submission",
    {
      title: "Prepare a RIFT submission",
      description: "Prepare a commit-reveal submission payload. Agents must keep the returned blob and use it later for both commit and reveal.",
      inputSchema: schemas.prepareSubmissionSchema,
    },
    async ({ resultData, attestation }) => {
      const sdk = createBackendRiftClient();
      const prepared = sdk.submissions.prepare({
        resultData,
        attestation: Buffer.from(attestation ?? "", "utf8"),
      });
      const serialized: SerializedPreparedSubmission = {
        resultData: prepared.resultData,
        attestationBase64: prepared.attestation.toString("base64"),
        saltBase64: prepared.salt.toString("base64"),
        commitmentHashHex: prepared.commitmentHash.toString("hex"),
      };
      const blob = encodeAgentBlob(serialized);
      return text(blob, { blob, prepared: serialized });
    }
  );

  server.registerTool(
    "rift_commit_submission",
    {
      title: "Commit a RIFT submission",
      description: "Commit a prepared submission blob during the commit phase.",
      inputSchema: schemas.commitSubmissionSchema,
    },
    async ({ contestId, preparedSubmission }) => {
      const sdk = createBackendRiftClient();
      const serialized = decodeAgentBlob<SerializedPreparedSubmission>(preparedSubmission);
      const signature = await sdk.submissions.commit(contestId, {
        resultData: serialized.resultData,
        attestation: Buffer.from(serialized.attestationBase64, "base64"),
        salt: Buffer.from(serialized.saltBase64, "base64"),
        commitmentHash: Buffer.from(serialized.commitmentHashHex, "hex"),
      });
      return text(signature, { signature, contestId });
    }
  );

  server.registerTool(
    "rift_reveal_submission",
    {
      title: "Reveal a RIFT submission",
      description: "Reveal a prepared submission blob during the reveal phase.",
      inputSchema: schemas.revealSubmissionSchema,
    },
    async ({ contestId, preparedSubmission }) => {
      const sdk = createBackendRiftClient();
      const serialized = decodeAgentBlob<SerializedPreparedSubmission>(preparedSubmission);
      const signature = await sdk.submissions.reveal(contestId, {
        resultData: serialized.resultData,
        attestation: Buffer.from(serialized.attestationBase64, "base64"),
        salt: Buffer.from(serialized.saltBase64, "base64"),
        commitmentHash: Buffer.from(serialized.commitmentHashHex, "hex"),
      });
      return text(signature, { signature, contestId });
    }
  );

  server.registerTool(
    "rift_prepare_review",
    {
      title: "Prepare a RIFT review",
      description: "Prepare a review blob that contains the hidden salt needed for commit-reveal review flow.",
      inputSchema: schemas.prepareReviewSchema,
    },
    async ({ score }) => {
      const sdk = createBackendRiftClient();
      const prepared = sdk.reviews.prepare(score);
      const serialized: SerializedPreparedReview = {
        score: prepared.score,
        saltBase64: prepared.salt.toString("base64"),
        commitmentHashHex: prepared.commitmentHash.toString("hex"),
      };
      const blob = encodeAgentBlob(serialized);
      return text(blob, { blob, prepared: serialized });
    }
  );

  server.registerTool(
    "rift_commit_review",
    {
      title: "Commit a RIFT review",
      description: "Commit a prepared review blob for a submitter wallet during the review phase.",
      inputSchema: schemas.commitReviewSchema,
    },
    async ({ contestId, submitterWallet, preparedReview }) => {
      const sdk = createBackendRiftClient();
      const serialized = decodeAgentBlob<SerializedPreparedReview>(preparedReview);
      const signature = await sdk.reviews.commit(contestId, submitterWallet, {
        score: serialized.score,
        salt: Buffer.from(serialized.saltBase64, "base64"),
        commitmentHash: Buffer.from(serialized.commitmentHashHex, "hex"),
      });
      return text(signature, { signature, contestId, submitterWallet });
    }
  );

  server.registerTool(
    "rift_reveal_review",
    {
      title: "Reveal a RIFT review",
      description: "Reveal a prepared review blob for a submitter wallet during the review phase.",
      inputSchema: schemas.revealReviewSchema,
    },
    async ({ contestId, submitterWallet, preparedReview }) => {
      const sdk = createBackendRiftClient();
      const serialized = decodeAgentBlob<SerializedPreparedReview>(preparedReview);
      const signature = await sdk.reviews.reveal(contestId, submitterWallet, {
        score: serialized.score,
        salt: Buffer.from(serialized.saltBase64, "base64"),
        commitmentHash: Buffer.from(serialized.commitmentHashHex, "hex"),
      });
      return text(signature, { signature, contestId, submitterWallet });
    }
  );

  server.registerTool(
    "rift_finalize_contest",
    {
      title: "Finalize a RIFT contest",
      description: "Finalize a contest once it has reached the ended state.",
      inputSchema: schemas.contestIdSchema,
    },
    async ({ contestId }) => {
      const sdk = createBackendRiftClient();
      const signature = await sdk.contests.finalize(contestId);
      return text(signature, { signature, contestId });
    }
  );

  server.registerTool(
    "rift_claim_reward",
    {
      title: "Claim a RIFT reward",
      description: "Claim the reward for the backend signer wallet after contest finalization.",
      inputSchema: schemas.contestIdSchema,
    },
    async ({ contestId }) => {
      const sdk = createBackendRiftClient();
      const signature = await sdk.rewards.claim(contestId);
      return text(signature, { signature, contestId });
    }
  );

  server.registerTool(
    "rift_withdraw_stake",
    {
      title: "Withdraw RIFT stake",
      description: "Withdraw stake for the backend signer wallet after contest finalization.",
      inputSchema: schemas.contestIdSchema,
    },
    async ({ contestId }) => {
      const sdk = createBackendRiftClient();
      const signature = await sdk.rewards.withdrawStake(contestId);
      return text(signature, { signature, contestId });
    }
  );

  server.registerTool(
    "rift_get_participant",
    {
      title: "Get contest participant",
      description: "Fetch participant state for a specific contest and wallet.",
      inputSchema: schemas.participantLookupSchema,
    },
    async ({ contestId, wallet }) => {
      const sdk = createBackendRiftClient();
      const participant = await sdk.query.getParticipant(contestId, wallet);
      return text(JSON.stringify(participant, null, 2), participant);
    }
  );
}
