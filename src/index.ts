import { Lucid, Blockfrost, PaymentKeyHash, UTxO, } from "lucid-cardano";
import {Assets} from "lucid-cardano/custom_modules/cardano-multiplatform-lib-browser";
import { lockUtxo, matchingNumberAddress, redeemUtxo } from "./util";

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    cardano: any;
  }
}

const init = async (blockfrostUrl: string, projectId: string, pass: number, _pvk: string) => {
  const lucid = await Lucid.new(
    new Blockfrost(blockfrostUrl, projectId),
    "Testnet"
  );

  // console.log(pvk)
  // lucid.selectWalletFromPrivateKey(pvk);
  // throw Error("bad stuff")

  // Assumes you are in a browser environment
  const api = await window.cardano.nami.enable();
  lucid.selectWallet(api);

  return {
    lockTest: () => lockUtxo(lucid)(pass, BigInt(10000000)),
    redeemTest: () => redeemUtxo(lucid)(pass),
    fundsAvailable: (pkh: string) => lookupAvailableFunds(lucid)({
        [matchingNumberAddress(lucid)]: [{
          nativeScript: { unlockTime: 1654267530, pkh },
          asset: { currencySymbol: "", tokenName: "" },
        }],
      }),
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
  (_lucid: Lucid) =>
  (
    _pkh: PaymentKeyHash,
    unlockTime: number,
    assets: { currencySymbol: string; tokenName: string }
  ): ((u: UTxO) => boolean)[] =>
    [
      // unlock time check
      (_u) => (new Date()).getTime() > (unlockTime * 1000),
      // assetlcass check
      (u) => Object.keys(u.assets).includes(assets.currencySymbol + assets.tokenName),
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

  const flattenedUtxos = utxosAggregated.reduce((acc: UTxO[], cur) => cur.reduce((acc2,cur2) => [...acc2, ...cur2 ], acc) ,[])

  console.log(utxosAggregated);

  const tx = await lucid.newTx().collectFrom(flattenedUtxos).complete();
  const signed = await tx.sign().complete();
  const txHash = await signed.submit()

  return txHash;
};

const lookupAvailableFunds = (lucid: Lucid) => async (toClaim: ToClaim) => {
  const utxos = await Promise.all(
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

  const flattenedUtxos = utxos.reduce((acc: UTxO[], cur) => cur.reduce((acc2,cur2) => [...acc2, ...cur2 ], acc) ,[])

  const valueLocked = flattenedUtxos.reduce((acc: any, u: UTxO) => ({...acc, ...u.assets}) ,{})
  return valueLocked;
}


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
