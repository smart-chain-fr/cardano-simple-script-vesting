import { Lucid, Blockfrost, Network, WalletApi } from "lucid-cardano";
import {
  ToClaim,
  lookupAvailableFunds,
  claimVestedFunds,
  totalClaimableUtxos,
} from "./util";

export const NetworkTestnet = "Testnet" as Network;
export const NetworkMainnet = "Mainnet" as Network;
export const NetworkPreprod = "Preprod" as Network;
export const NetworkPreview = "Preview" as Network;

const blockfrostUrls: { [key: string]: string } = {
  [NetworkTestnet]: "https://cardano-testnet.blockfrost.io/api/v0",
  [NetworkMainnet]: "https://cardano.blockfrost.io/api/v0",
  [NetworkPreprod]: "https://cardano-preprod.blockfrost.io/api/v0",
  [NetworkPreview]: "https://cardano-preview.blockfrost.io/api/v0",
};

export class Claim {
  walletApi: WalletApi;

  clientInstance: Lucid | undefined;

  network: Network;

  blockfrostKey: string;

  constructor(
    network: Network,
    walletApi: WalletApi,
    blockfrostKey: string
  ) {
    if (!blockfrostKey) {
      throw new Error("Invalid API Key");
    }
    this.walletApi = walletApi;
    this.network = network;
    this.blockfrostKey = blockfrostKey;
  }

  async client(): Promise<Lucid> {
    if (!this.clientInstance) {
      const bfAPI = new Blockfrost(
        blockfrostUrls[this.network],
        this.blockfrostKey
      );
      const lucidClient = await Lucid.new(bfAPI, this.network);
      if (this.walletApi.toString().startsWith("ed25519")) {
        this.clientInstance = await lucidClient.selectWalletFromPrivateKey(
          this.walletApi.toString()
        );
      } else {
        // For browser wallet:
        this.clientInstance = await lucidClient.selectWallet(
          this.walletApi
        );
      }
    }
    return this.clientInstance;
  }

  async fundsAvailable(epData: ToClaim) {
    const client = await this.client();
    const funds = totalClaimableUtxos(
      await lookupAvailableFunds(client)(epData)
    );
    return funds;
  }

  async claimFunds(epData: ToClaim) {
    const client = await this.client();
    const txHash = await claimVestedFunds(client)(epData);
    return txHash;
  }
}

export const networkName = (key: string): Network => {
  if (!key) {
    throw new Error("Invalid network key");
  }

  switch (key.toLowerCase()) {
    case "testnet":
      return NetworkTestnet;
    case "mainnet":
      return NetworkMainnet;
    case "preprod":
      return NetworkPreprod;
    case "preview":
      return NetworkPreview;
    default:
      throw new Error(`Network not supported: ${key}`);
  }
};
