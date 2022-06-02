import { Lucid, Blockfrost } from "lucid-cardano";
import { lockUtxo, redeemUtxo } from "./util";

declare global {
  // eslint-disable-line no-unused-vars
  interface Window {
    cardano: any;
  }
}

const init = async (blockfrostUrl: string, projectId: string, pass: number) => {
  const lucid = await Lucid.new(
    new Blockfrost(blockfrostUrl, projectId),
    "Testnet"
  );

  const api = await window.cardano.nami.enable();
  // Assumes you are in a browser environment
  lucid.selectWallet(api);

  return {
    lockTest: () => lockUtxo(lucid)(pass, BigInt(10000000)),
    redeemTest: () => redeemUtxo(lucid)(pass),
  };
};

export default init;
