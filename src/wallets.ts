// @ts-ignore
import { WalletApi } from "lucid-cardano";

const supportedProviders: { [key: string]: boolean } = {
  nami: true,
  flint: true,
  yoroi: true,
};

const selectWalletProvider = async (
  provider = "nami"
): Promise<WalletApi> => {
  if (provider.startsWith("ed25519")) return provider as unknown as WalletApi;
  if (!supportedProviders[provider]) {
    throw new Error(`Invalid Wallet Provider: ${provider}`);
  }

  const context = window as any;
  if (!context.cardano || !context.cardano[provider]) {
    throw new Error("cardano provider instance not found in context");
  }

  const walletApi = (await context.cardano[
    provider
  ].enable()) as WalletApi;
  return walletApi;
};

export default selectWalletProvider;
