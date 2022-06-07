import { Lucid, Blockfrost, PaymentKeyHash, UTxO, } from "lucid-cardano";
import { lockUtxo, matchingNumberAddress, redeemUtxo } from "./util";

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    cardano: any;
  }
}

const init = async (blockfrostUrl: string, projectId: string, pass: number, pvk: string) => {
  const lucid = await Lucid.new(
    new Blockfrost(blockfrostUrl, projectId),
    "Testnet"
  );

  console.log(pvk)
  lucid.selectWalletFromPrivateKey(pvk);
  throw Error("bad stuff")

  // Assumes you are in a browser environment
  // const api = await window.cardano.nami.enable();
  // lucid.selectWallet(api);

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


// const entropy = mnemonicToEntropy("slow bonus employ over frequent clip derive burst quit chase language rhythm enough fruit calm airport subway mother captain mango visual shoot invest name");

// const rootKey = C.Bip32PrivateKey.from_bip39_entropy(
//   Buffer.from(entropy, 'hex'),
//   Buffer.from(''),
// );

// init(
//       "https://cardano-testnet.blockfrost.io/api/v0",
//       "testnetLcLqm10CEnmMJEzLMtp7w3MtaxhKKE13",
//       12344321,
//       rootKey.to_bech32(),
//     ).then(r => r.lockTest())


export default init;
