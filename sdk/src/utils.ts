import crypto from "crypto";
import {
  Keypair,
  PublicKey,
  Transaction,
  type TransactionInstruction,
} from "@solana/web3.js";
import { FUNDING_BURN_BPS, TOKEN_DECIMALS } from "./constants";
import { RiftTransactionError, RiftValidationError } from "./errors";
import type {
  FundingBreakdown,
  RiftClientConfig,
  RiftSigner,
  RiftSignerLike,
  TokenAmountInput,
} from "./types";

export function isKeypair(signer: RiftSignerLike): signer is Keypair {
  return signer instanceof Keypair;
}

export function toRiftSigner(signer: RiftSignerLike): RiftSigner {
  if (isKeypair(signer)) {
    return {
      publicKey: signer.publicKey,
      signTransaction(transaction: Transaction): Transaction {
        transaction.partialSign(signer);
        return transaction;
      },
    };
  }

  return signer;
}

export function getInstructionDiscriminator(name: string): Buffer {
  return crypto.createHash("sha256").update(`global:${name}`).digest().slice(0, 8);
}

export function u64LE(value: bigint): Buffer {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(value);
  return buffer;
}

export function u32LE(value: number): Buffer {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value);
  return buffer;
}

export function u16LE(value: number): Buffer {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

export function i64LE(value: bigint): Buffer {
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64LE(value);
  return buffer;
}

export function encodeString(value: string): Buffer {
  const text = Buffer.from(value, "utf8");
  return Buffer.concat([u32LE(text.length), text]);
}

export function encodeBytes(value: Buffer | Uint8Array): Buffer {
  const bytes = Buffer.from(value);
  return Buffer.concat([u32LE(bytes.length), bytes]);
}

export function parseTokenAmount(value: TokenAmountInput, decimals = TOKEN_DECIMALS): bigint {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0) {
      throw new RiftValidationError(`Invalid token amount: ${value}`);
    }
    return parseTokenAmount(value.toString(), decimals);
  }

  const trimmed = value.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new RiftValidationError(`Invalid token amount string: ${value}`);
  }

  const [whole, fraction = ""] = trimmed.split(".");
  const normalizedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(normalizedFraction || "0");
}

export function formatTokenAmount(value: bigint, decimals = TOKEN_DECIMALS): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = value / divisor;
  const fraction = value % divisor;
  if (fraction === 0n) {
    return whole.toString();
  }
  return `${whole}.${fraction.toString().padStart(decimals, "0").replace(/0+$/, "")}`;
}

export function resolveFundingBreakdown(grossAmount: TokenAmountInput): FundingBreakdown {
  const gross = parseTokenAmount(grossAmount);
  const burnAmount = (gross * BigInt(FUNDING_BURN_BPS)) / 10_000n;
  return {
    grossAmount: gross,
    burnAmount,
    netAmount: gross - burnAmount,
  };
}

export function requirePublicKey(value: string | PublicKey): PublicKey {
  return typeof value === "string" ? new PublicKey(value) : value;
}

export async function sendAndConfirmInstructions(
  config: RiftClientConfig,
  instructions: TransactionInstruction[],
  label?: string
): Promise<string> {
  const signer = toRiftSigner(config.signer);
  const transaction = new Transaction();
  instructions.forEach((instruction) => transaction.add(instruction));
  transaction.feePayer = signer.publicKey;

  const latestBlockhash = await config.connection.getLatestBlockhash(config.commitment);
  transaction.recentBlockhash = latestBlockhash.blockhash;

  const signed = await signer.signTransaction(transaction);
  const signature = await config.connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: config.confirmOptions?.skipPreflight ?? false,
    preflightCommitment: config.confirmOptions?.preflightCommitment ?? config.commitment,
    maxRetries: config.confirmOptions?.maxRetries,
  });

  const confirmation = await config.connection.confirmTransaction(
    {
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    },
    config.confirmOptions?.commitment ?? config.commitment
  );

  if (confirmation.value.err) {
    throw new RiftTransactionError(
      `${label ?? "transaction"} failed: ${JSON.stringify(confirmation.value.err)}`
    );
  }

  return signature;
}
