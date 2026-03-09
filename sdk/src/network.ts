import { PublicKey } from "@solana/web3.js";
import { DEFAULT_ADDRESSES } from "./constants";
import type { RiftProgramAddresses } from "./types";

export type RiftCluster = "devnet" | "mainnet" | "mainnet-beta";

export interface RiftRpcConfig {
  cluster: RiftCluster;
  rpcUrl: string;
  rpcBackupUrl?: string;
  rpcWebsocketUrl?: string;
}

function getEnvPublicKey(name: string): PublicKey | undefined {
  const value = process.env[name];
  if (!value) {
    return undefined;
  }
  return new PublicKey(value);
}

export function resolveRpcConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  defaults: RiftRpcConfig = {
    cluster: "devnet",
    rpcUrl: "https://api.devnet.solana.com",
  }
): RiftRpcConfig {
  const clusterValue = env.RIFT_CLUSTER ?? defaults.cluster;
  const cluster: RiftCluster =
    clusterValue === "mainnet" || clusterValue === "mainnet-beta"
      ? "mainnet-beta"
      : "devnet";

  return {
    cluster,
    rpcUrl: env.RIFT_RPC_URL ?? defaults.rpcUrl,
    rpcBackupUrl: env.RIFT_RPC_BACKUP_URL,
    rpcWebsocketUrl: env.RIFT_RPC_WSS_URL,
  };
}

export function resolveAddressesFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  defaults: RiftProgramAddresses = DEFAULT_ADDRESSES
): RiftProgramAddresses {
  return {
    tokenProgramId: getEnvPublicKey("RIFT_TOKEN_PROGRAM_ID") ?? defaults.tokenProgramId,
    contestProgramId: getEnvPublicKey("RIFT_CONTEST_PROGRAM_ID") ?? defaults.contestProgramId,
    tokenMint: getEnvPublicKey("RIFT_TOKEN_MINT") ?? defaults.tokenMint,
    protocolConfig: getEnvPublicKey("RIFT_PROTOCOL_CONFIG") ?? defaults.protocolConfig,
  };
}

export function getExplorerClusterParam(cluster: RiftCluster): string {
  return cluster === "devnet" ? "devnet" : "mainnet-beta";
}
