import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { DEFAULT_ADDRESSES } from "./constants";
import { RiftContestsClient } from "./contests";
import { RiftParticipantsClient } from "./participants";
import { RiftQueryClient } from "./query";
import { RiftRewardsClient } from "./rewards";
import { RiftReviewsClient } from "./reviews";
import { RiftSubmissionsClient } from "./submissions";
import { resolveAddressesFromEnv } from "./network";
import type { RiftClientConfig, RiftProgramAddresses } from "./types";
import { sendAndConfirmInstructions, toRiftSigner } from "./utils";

export class RiftClient {
  public readonly addresses: RiftProgramAddresses;
  public readonly query: RiftQueryClient;
  public readonly contests: RiftContestsClient;
  public readonly participants: RiftParticipantsClient;
  public readonly submissions: RiftSubmissionsClient;
  public readonly reviews: RiftReviewsClient;
  public readonly rewards: RiftRewardsClient;

  constructor(public readonly config: RiftClientConfig) {
    this.addresses = {
      ...DEFAULT_ADDRESSES,
      ...resolveAddressesFromEnv(),
      ...config.addresses,
    };
    this.query = new RiftQueryClient(config.connection, this.addresses);
    this.contests = new RiftContestsClient(this);
    this.participants = new RiftParticipantsClient(this);
    this.submissions = new RiftSubmissionsClient(this);
    this.reviews = new RiftReviewsClient(this);
    this.rewards = new RiftRewardsClient(this);
  }

  get publicKey(): PublicKey {
    return toRiftSigner(this.config.signer).publicKey;
  }

  async send(instructions: TransactionInstruction[], label?: string): Promise<string> {
    return sendAndConfirmInstructions(this.config, instructions, label);
  }
}
