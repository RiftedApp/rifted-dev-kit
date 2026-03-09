import { PublicKey } from "@solana/web3.js";
import type { RiftProgramAddresses } from "./types";

export const TOKEN_DECIMALS = 9;
export const PRECISION_SCALE = 1_000_000n;
export const COMMIT_PHASE_RATIO = 40;
export const REVEAL_PHASE_RATIO = 30;
export const REVIEW_PHASE_RATIO = 30;
export const FUNDING_BURN_BPS = 100;

export const DEFAULT_ADDRESSES: RiftProgramAddresses = {
  tokenProgramId: new PublicKey("5kCioito1CpAxEuqaMAQsyrZ1gt5tQQ8qnKzG3V816gb"),
  contestProgramId: new PublicKey("35UXUBPvYUG5zqnMRfnGduD5WBnQ6qWadW7m3gaaKSD1"),
  tokenMint: new PublicKey("GipLeHSJnqeMrvMzaxzzGeJ7tygfiwPc5s6F3JrrAJnP"),
  protocolConfig: new PublicKey("64ehBrVDNpPDqwzLZ37yxRhXDX1nXFiDjYS1UNEn2Mfd"),
};
