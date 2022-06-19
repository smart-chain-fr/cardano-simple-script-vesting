import { Lucid, Blockfrost, PaymentKeyHash, UTxO, Assets } from "lucid-cardano";
import { buildTimelockedNativeScript } from "./util";

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    cardano: any;
  }
}

const init = async (blockfrostUrl: string, projectId: string, pvk: string) => {
  const lucid = await Lucid.new(
    new Blockfrost(blockfrostUrl, projectId),
    "Testnet"
  );

  lucid.selectWalletFromPrivateKey(pvk);

  // Assumes you are in a browser environment
  // const api = await window.cardano.nami.enable();
  // lucid.selectWallet(api);

  return {
    fundsAvailable: async (tc: ToClaim) =>
      totalClaimableUtxos(await lookupAvailableFunds(lucid)(tc)),
    claimFunds: (tc: ToClaim) => claimVestedFunds(lucid)(tc),
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
    _pkh: PaymentKeyHash,
    unlockTime: number,
    assets: { currencySymbol: string; tokenName: string }
  ): ((u: UTxO) => boolean)[] =>
    [
      // unlock time check
      (_u) => lucid.utils.unixTimeToSlot(Date.now()) > unlockTime,
      // assetlcass check
      (u) => !!assets || !!u.assets || true,
      // Object.keys(u.assets).includes(
      //   assets.currencySymbol + assets.tokenName
      // ),
    ];

const claimVestedFunds = (lucid: Lucid) => async (toClaim: ToClaim) => {
  const claimableUtxos = await lookupAvailableFunds(lucid)(toClaim);
  if (!claimableUtxos.length) throw Error("Nothing to claim")

  const natives = claimableUtxos.map(x => buildTimelockedNativeScript(x.nativeScript.unlockTime, x.nativeScript.pkh))
    // Object.values(toClaim).map(x => x.map(y => y.nativeScript).flat()).flat().map(x => buildTimelockedNativeScript(x.unlockTime, x.pkh))

  const tx = lucid
    .newTx()
    .collectFrom(claimableUtxos.map((x) => x.utxos).flat());

  [natives[0]].forEach((n) => tx.txBuilder.add_native_script(n));

  // throw Error("stopping")

  const txScriptAttached = await tx.validFrom(Date.now() - 100000).complete();
  // console.log(txScriptAttached.txComplete.to_json());

  const signed = await txScriptAttached.sign().complete();
  // console.log(signed.txSigned.to_js_value());
  // throw Error("stopping")

  const txHash = await signed.submit();
  return txHash;
};

const totalClaimableUtxos = (
  flattenedUtxos: {
    utxos: UTxO[];
    nativeScript: {pkh: string, unlockTime: number};
  }[]
) =>
  flattenedUtxos
    .map((x) => x.utxos.map((x) => x.assets))
    .flat()
    .reduce(
      (acc: Assets, cur: Assets) =>
        Object.entries(cur).reduce(
          (acc2: Assets, [a, v]) =>
            a in acc2
              ? { ...acc2, [a]: acc2[a].valueOf() + v.valueOf() }
              : { ...acc2, [a]: v },
          acc
        ),
      {}
    );

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
          return { utxos: claimableUtxos, nativeScript: tc.nativeScript };
        })
      )
    )
  );

  const flattenedUtxos = utxos.reduce(
    (acc: { utxos: UTxO[]; nativeScript: {pkh: string, unlockTime: number} }[], cur) =>
      cur.reduce((acc2, cur2) => [...acc2, cur2], acc),
    []
  );

  // TODO: change any to Assets
  const totalValueLocked = flattenedUtxos
    .map((x) => x.utxos.map((x) => x.assets))
    .flat()
    .reduce(
      (acc: Assets, cur: Assets) =>
        Object.entries(cur).reduce(
          (acc2: Assets, [a, v]) =>
            a in acc2
              ? { ...acc2, [a]: acc2[a].valueOf() + v.valueOf() }
              : { ...acc2, [a]: v },
          acc
        ),
      {}
    );

  console.log(totalValueLocked);
  // console.log(flattenedUtxos);

  return flattenedUtxos.filter(x => !!x.utxos.length);
};

export default init;
