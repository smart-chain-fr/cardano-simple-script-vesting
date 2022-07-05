import { C, Lucid, PaymentKeyHash, UTxO } from "lucid-cardano";

type GroupedByScript = {
  address: string;
  nativeScript: { pkh: string; unlockTime: number };
  assets: { currencySymbol: string; tokenName: string }[];
};

export type ToClaim = {
  [key: string]: {
    nativeScript: { pkh: string; unlockTime: number };
    asset: { currencySymbol: string; tokenName: string };
  }[];
};

export const deduplicateUtxosReducer = (
  acc: UTxO[],
  cur: { utxos: UTxO[]; nativeScript: any }
) => [
  ...acc,
  ...cur.utxos.filter(
    (newUtxo) =>
      !acc.some(
        (existingUtxo) =>
          newUtxo.txHash === existingUtxo.txHash &&
          newUtxo.outputIndex === existingUtxo.outputIndex
      )
  ),
];

export const claimChecks =
  (lucid: Lucid) =>
  (
    pkh: PaymentKeyHash,
    unlockTime: number,
    assets: { currencySymbol: string; tokenName: string }[]
  ) =>
    [
      // unlock time check
      () => lucid.utils.unixTimeToSlot(Date.now()) > unlockTime,
      // assetlcass check
      (u: UTxO) => {
        const assetsConcat = assets.map(asset => {
          let assetConcat = asset.currencySymbol + asset.tokenName;
          if (!assetConcat.length) {
            assetConcat = "lovelace";
          }
          return assetConcat;
        })

        const containsAssets = assetsConcat.some((asset) => Object.keys(u.assets).includes(asset))

        return !!u.assets && containsAssets;
      },
      // Object.keys(u.assets).includes(
      //   assets.currencySymbol + assets.tokenName
      // ),
      () => !!pkh,
    ];

export const buildTimelockedNativeScript = (slot: number, pkh: string) => {
  const ns = C.NativeScripts.new();

  ns.add(
    C.NativeScript.new_timelock_start(
      C.TimelockStart.new(C.BigNum.from_str(slot.toString()))
    )
  );
  ns.add(
    C.NativeScript.new_script_pubkey(
      C.ScriptPubkey.new(C.Ed25519KeyHash.from_hex(pkh))
    )
  );

  const scriptAll = C.ScriptAll.new(ns);
  return C.NativeScript.new_script_all(scriptAll);
};


export const groupByScript = (toClaim: ToClaim) => Object.entries(toClaim).reduce(
    (acc: GroupedByScript[], [address, value]) =>
      value.reduce((acc2: GroupedByScript[], nc) => {
        const seenIndex = acc2.findIndex(
          (x) =>
            x.address === address &&
            x.nativeScript.pkh === nc.nativeScript.pkh &&
            x.nativeScript.unlockTime === nc.nativeScript.unlockTime
        );
        if (seenIndex >= 0) {
          acc2[seenIndex].assets.push(nc.asset);
          return acc2;
        }
        return [
          ...acc2,
          {
            address,
            nativeScript: nc.nativeScript,
            assets: [nc.asset],
          },
        ];
      }, acc),
    []
  );
