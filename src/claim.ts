import { Lucid, Blockfrost, PaymentKeyHash, UTxO, C} from "lucid-cardano";
import { lockUtxo, redeemUtxo } from "./util";

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    cardano: any;
  }
}

const init = async (
  blockfrostUrl: string,
  projectId: string,
  pass: number,
  pvk: string
) => {
  const lucid = await Lucid.new(
    new Blockfrost(blockfrostUrl, projectId),
    "Testnet"
  );

  const generated = C.PrivateKey.generate_ed25519()
  console.log(generated)
  console.log(generated.to_bech32())

  // console.log(pvk)
  lucid.selectWalletFromPrivateKey(pvk);
  // throw Error("bad stuff")

  // Assumes you are in a browser environment
  // const api = await window.cardano.nami.enable();
  // lucid.selectWallet(api);

  return {
    lockTest: () => lockUtxo(lucid)(pass, BigInt(10000000)),
    redeemTest: () => redeemUtxo(lucid)(pass),
    fundsAvailable: (pkh: string) =>
      lookupAvailableFunds(lucid)({
        'addr_test1wqflq3fxkyhnf6jchk30039f9pkj340smaxc4t8sa5q9fccmh3w4d': [
          {
            nativeScript: { unlockTime: 1654267530, pkh },
            asset: { currencySymbol: "", tokenName: "" },
          },
        ],
      }),
    claimFunds: (pkh: string) =>
      claimVestedFunds(lucid)({
        'addr_test1wqflq3fxkyhnf6jchk30039f9pkj340smaxc4t8sa5q9fccmh3w4d': [
          {
            nativeScript: { unlockTime: 1654267530, pkh },
            asset: { currencySymbol: "", tokenName: "" },
          },
        ],
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
      (_u) => new Date().getTime() > unlockTime * 1000,
      // assetlcass check
      (u) => !!assets || !!u.assets || true
        // Object.keys(u.assets).includes(
        //   assets.currencySymbol + assets.tokenName
        // ),
    ];

const claimVestedFunds = (lucid: Lucid) => async (toClaim: ToClaim) => {
  const claimableUtxos = await lookupAvailableFunds(lucid)(toClaim);
  console.log(claimableUtxos)

  // const nativeJson = '{ "type": "all", "scripts": [ { "type": "after", "slot": 1000 }, { "type": "sig", "keyHash": "aa6149edaa31bceb7f4d81b43bba6728a53ca6ed26d529019dc2b601" } ] } ';

  const ns = C.NativeScripts.new()

  ns.add(C.NativeScript.new_timelock_start(C.TimelockStart.new(C.BigNum.from_str('1000'))))
  ns.add(C.NativeScript.new_script_pubkey(C.ScriptPubkey.new(C.Ed25519KeyHash.from_hex("aa6149edaa31bceb7f4d81b43bba6728a53ca6ed26d529019dc2b601" ))))

  const scriptAll = C.ScriptAll.new(ns)

  console.log(scriptAll.to_json())

  // throw Error('stopping')

  const native = C.NativeScript.new_script_all(scriptAll)

  // console.log(native.get_required_signers().len())
  console.log('hash', native.hash(C.ScriptHashNamespace.NativeScript).to_bech32("addr_test"))

  console.log(native.to_json())
  // console.log(native.to_js_value())

  const tx = lucid.newTx().collectFrom(claimableUtxos)
  // console.log(tx)

  tx.txBuilder.add_native_script(native)

  const txScriptAttached = await tx.complete()


  const signed = await txScriptAttached.sign().complete();

  console.log('pointer', signed.txSigned.to_json())

  console.log(signed.txSigned)
  const txHash = await signed.submit();
  console.log(txHash)

  return txHash;
};

const lookupAvailableFunds = (lucid: Lucid) => async (toClaim: ToClaim) => {
  const utxos = await Promise.all(
    Object.entries(toClaim).map(async ([address, tcs]) =>
      Promise.all(
        tcs.map(async (tc) => {
          const utxos = (await lucid.utxosAt(address)).map((u) => ({
            ...u,
            addressDetails: lucid.utils.getAddressDetails(u.address),
          }));

          const predicates = claimChecks(lucid)(
            tc.nativeScript.pkh,
            tc.nativeScript.unlockTime,
            tc.asset
          );

          const claimableUtxos = utxos.filter((utxo) =>
            predicates.reduce(
              (acc: boolean, predicate) => acc && predicate(utxo),
              true
            )
          );
          return claimableUtxos;
        })
      )
    )
  );

  const flattenedUtxos = utxos.reduce(
    (acc: UTxO[], cur) => cur.reduce((acc2, cur2) => [...acc2, ...cur2], acc),
    []
  );

  // console.log(flattenedUtxos)

  // TODO: change any to Assets
  const valueLocked = flattenedUtxos.reduce(
    (acc: any, u: UTxO) => ({ ...acc, ...u.assets }),
    {}
  );

  console.log(valueLocked)

  return flattenedUtxos;
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
