import { Connection, Transaction } from "@solana/web3.js";
import { RiftClient, type RiftSigner } from "../src";

type BrowserWallet = {
  publicKey: import("@solana/web3.js").PublicKey;
  signTransaction(transaction: Transaction): Promise<Transaction>;
};

export async function createClient(wallet: BrowserWallet) {
  const signer: RiftSigner = {
    publicKey: wallet.publicKey,
    signTransaction: (transaction) => wallet.signTransaction(transaction),
  };

  return new RiftClient({
    connection: new Connection("https://api.devnet.solana.com", "confirmed"),
    signer,
  });
}

export async function joinContestWithWallet(wallet: BrowserWallet, contestId: number) {
  const sdk = await createClient(wallet);
  return sdk.participants.join(contestId, "100");
}
