import { Lucid, Blockfrost, PaymentKeyHash, UTxO } from "lucid-cardano";
import { lockUtxo, matchingNumberAddress, redeemUtxo } from "./util";

declare global {
  // eslint-disable-next-line no-unused-vars
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
    claimFunds: (pkh: string) =>
      claimVestedFunds(lucid)({
        [matchingNumberAddress(lucid)]: [{
          nativeScript: { unlockTime: 1654267530, pkh },
          asset: { currencySymbol: "", tokenName: "" },
        }],
      }),
  };
};

type ToClaim = {
  [key: string]: {
    nativeScript: { pkh: string; unlockTime: number };
    asset: { currencySymbol: string; tokenName: string };
  }[];
};

const claimChecks =
  (lucid: Lucid) =>
  (
    pkh: PaymentKeyHash,
    _unlockTime: number,
    _assets: { currencySymbol: string; tokenName: string }
  ): ((u: UTxO) => boolean)[] =>
    [
      // pkh check
      (u) =>
        lucid.utils.getAddressDetails(u.address).paymentCredential?.hash ===
        pkh,
      // unlock time check
      (_u) => true,
      // assetlcass check
      (_u) => true,
    ];

const claimVestedFunds = (lucid: Lucid) => async (toClaim: ToClaim) => {
  const utxosAggregated = await Promise.all(
    Object.entries(toClaim).map(async ([address, tcs]) =>
      Promise.all(
        tcs.map(async (tc) => {
          const utxos = (await lucid.utxosAt(address)).map(u => ({...u, addressDetails: lucid.utils.getAddressDetails(u.address)}));
          console.log(utxos)

          const predicates = claimChecks(lucid)(
            tc.nativeScript.pkh,
            tc.nativeScript.unlockTime,
            tc.asset
          );

          const claimableUtxos = utxos.filter((utxo) =>
            predicates.reduce((acc: boolean, predicate) => acc && predicate(utxo), true)
          );
          return claimableUtxos;
        })
      )
    )
  );

  console.log(utxosAggregated);
  // const tx = lucid.newTx().collectFrom();
};

export default init;
