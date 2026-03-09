import type { PublicKey } from "@solana/web3.js";
import { RiftValidationError } from "./errors";
import { buildCancelContestIx, buildCreateContestIx, buildFinalizeContestIx, buildFundRewardPoolIx } from "./instructions";
import { validateMetadata } from "./metadata";
import { getContestPda, getContestVaultPda } from "./pdas";
import type {
  CreateAndFundContestInput,
  CreateAndFundContestResult,
  CreateContestInput,
  CreateContestResult,
  FundingBreakdown,
} from "./types";
import { parseTokenAmount, resolveFundingBreakdown } from "./utils";
import { resolveContestParams } from "./validation";
import type { RiftClient } from "./client";

export class RiftContestsClient {
  constructor(private readonly client: RiftClient) {}

  estimateFunding(amount: bigint | number | string): FundingBreakdown {
    return resolveFundingBreakdown(amount);
  }

  async create(input: CreateContestInput): Promise<CreateContestResult> {
    if (input.metadata) {
      validateMetadata(input.metadata);
    }

    const protocol = await this.client.query.getProtocolConfig();
    const contestId = protocol.contestCount + 1;
    const contest = getContestPda(this.client.addresses.contestProgramId, contestId);
    const contestVault = getContestVaultPda(this.client.addresses.contestProgramId, contestId);
    const params = resolveContestParams(input.params);

    const ix = buildCreateContestIx({
      addresses: this.client.addresses,
      creator: this.client.publicKey,
      contestId,
      contest,
      contestVault,
      metadataUri: input.metadataUri,
      params,
    });

    const signature = await this.client.send([ix], "create contest");
    return {
      contestId,
      contestAddress: contest.toBase58(),
      signature,
    };
  }

  async fund(contestId: number, amount: bigint | number | string): Promise<{ signature: string; funding: FundingBreakdown }> {
    const contest = getContestPda(this.client.addresses.contestProgramId, contestId);
    const contestVault = getContestVaultPda(this.client.addresses.contestProgramId, contestId);
    const grossAmount = parseTokenAmount(amount);
    if (grossAmount <= 0n) {
      throw new RiftValidationError("Funding amount must be greater than zero");
    }

    const ix = buildFundRewardPoolIx({
      addresses: this.client.addresses,
      funder: this.client.publicKey,
      contest,
      contestVault,
      amount: grossAmount,
    });

    const signature = await this.client.send([ix], "fund reward pool");
    return {
      signature,
      funding: resolveFundingBreakdown(grossAmount),
    };
  }

  async createAndFund(input: CreateAndFundContestInput): Promise<CreateAndFundContestResult> {
    const created = await this.create(input);
    const funded = await this.fund(created.contestId, input.fundingAmount);

    return {
      contestId: created.contestId,
      contestAddress: created.contestAddress,
      createSignature: created.signature,
      fundSignature: funded.signature,
      funding: funded.funding,
    };
  }

  async finalize(contestId: number): Promise<string> {
    const contest = getContestPda(this.client.addresses.contestProgramId, contestId);
    const ix = buildFinalizeContestIx({
      addresses: this.client.addresses,
      authority: this.client.publicKey,
      contest,
    });
    return this.client.send([ix], "finalize contest");
  }

  async cancel(contestId: number): Promise<string> {
    const contest = getContestPda(this.client.addresses.contestProgramId, contestId);
    const ix = buildCancelContestIx({
      addresses: this.client.addresses,
      authority: this.client.publicKey,
      contest,
    });
    return this.client.send([ix], "cancel contest");
  }

  getContestAddress(contestId: number): PublicKey {
    return getContestPda(this.client.addresses.contestProgramId, contestId);
  }
}
