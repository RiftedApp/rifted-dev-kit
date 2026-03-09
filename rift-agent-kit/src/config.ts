import fs from "fs";
import path from "path";
import os from "os";
import { Connection, Keypair, Transaction } from "@solana/web3.js";
import {
  RiftClient,
  type RiftSigner,
  DEFAULT_ADDRESSES,
  resolveAddressesFromEnv,
  resolveRpcConfigFromEnv,
} from "@rifted/sdk";

export type AgentRuntimeMode = "backend-signer";

export interface AgentRuntimeConfig {
  cluster: "devnet" | "mainnet" | "mainnet-beta";
  rpcUrl: string;
  rpcBackupUrl?: string;
  rpcWebsocketUrl?: string;
  keypairPath: string;
  mode: AgentRuntimeMode;
}

export function getRuntimeConfig(): AgentRuntimeConfig {
  const rpc = resolveRpcConfigFromEnv();
  return {
    cluster: rpc.cluster,
    rpcUrl: rpc.rpcUrl,
    rpcBackupUrl: rpc.rpcBackupUrl,
    rpcWebsocketUrl: rpc.rpcWebsocketUrl,
    keypairPath:
      process.env.RIFT_KEYPAIR_PATH ?? path.join(os.homedir(), ".config/solana/id.json"),
    mode: "backend-signer",
  };
}

export function loadBackendKeypair(keypairPath: string): Keypair {
  const secretKey = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
  return Keypair.fromSecretKey(new Uint8Array(secretKey));
}

export function createBackendSigner(keypair: Keypair): RiftSigner {
  return {
    publicKey: keypair.publicKey,
    signTransaction(transaction: Transaction): Transaction {
      transaction.partialSign(keypair);
      return transaction;
    },
  };
}

export function createBackendRiftClient(): RiftClient {
  const runtime = getRuntimeConfig();
  const connection = new Connection(runtime.rpcUrl, "confirmed");
  const signer = createBackendSigner(loadBackendKeypair(runtime.keypairPath));

  return new RiftClient({
    connection,
    signer,
    addresses: {
      ...DEFAULT_ADDRESSES,
      ...resolveAddressesFromEnv(),
    },
  });
}
