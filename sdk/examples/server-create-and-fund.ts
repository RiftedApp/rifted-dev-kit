import fs from "fs";
import os from "os";
import path from "path";
import { Connection, Keypair, Transaction } from "@solana/web3.js";
import { RiftClient, type RiftSigner } from "../src";

function loadKeypair(): Keypair {
  const walletPath = path.join(os.homedir(), ".config/solana/id.json");
  const secretKey = JSON.parse(fs.readFileSync(walletPath, "utf8"));
  return Keypair.fromSecretKey(new Uint8Array(secretKey));
}

function keypairSigner(keypair: Keypair): RiftSigner {
  return {
    publicKey: keypair.publicKey,
    signTransaction(transaction: Transaction): Transaction {
      transaction.partialSign(keypair);
      return transaction;
    },
  };
}

async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const signer = keypairSigner(loadKeypair());

  const sdk = new RiftClient({ connection, signer });
  const result = await sdk.contests.createAndFund({
    metadataUri: "https://rifted.ai/contests/music-gen",
    metadata: {
      title: "Music generation quality benchmark",
      description: "Evaluate quality and consistency of generated music clips.",
      category: "music",
      task: "Generate 30 second clips from prompts",
      inputSpec: "Prompt string",
      outputSpec: "Audio output URI",
      scoringMethod: "Peer review score between 0 and 1e6",
      reviewRules: "No self-review. Reviewers score prompt adherence and quality.",
      attestationRequirement: "tee-planned",
      tags: ["music", "audio", "gen-ai"],
    },
    params: {
      duration: 60 * 60,
      minStakeAmount: "100",
      maxParticipants: 100,
      reviewCount: 3,
      priceIncrementBps: 0,
    },
    fundingAmount: "50000",
  });

  console.log(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
