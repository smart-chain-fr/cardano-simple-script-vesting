import { C, Lucid, PaymentKeyHash, UTxO } from "lucid-cardano";

type ScriptAssets = {
  address: string;
  nativeScript: { pkh: string; unlockTime: number };
  assets: { currencySymbol: string; tokenName: string }[];
};

const groupBy = <T>(array: T[], predicate: (_a: T) => string) =>
  array.reduce((acc: { [key: string]: T[] }, cur: T) => {
    const key = predicate(cur);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(cur);
    return acc;
  }, {});

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
        const assetsConcat = assets.map((asset) => {
          let assetConcat = asset.currencySymbol + asset.tokenName;
          if (!assetConcat.length) {
            assetConcat = "lovelace";
          }
          return assetConcat;
        });

        const containsAssets = assetsConcat.some((asset) =>
          Object.keys(u.assets).includes(asset)
        );

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

export const groupByScript = (toClaim: ToClaim): ScriptAssets[] => {
  // flattened entries into an array of native script with address as field
  type SingleScriptAsset = {
    nativeScript: { pkh: string; unlockTime: number };
    asset: { currencySymbol: string; tokenName: string };
    address: string;
  };

  const withAddress: SingleScriptAsset[] = Object.entries(toClaim)
    .map(([address, entries]) =>
      entries.map((entry) => ({ address, ...entry }))
    )
    .flat();

  // groups native scripts by address and native script (pkh and unlockTime)
  // This is to extract unique products of the form { address, nativeScript }
  const groupedByAddress: {
    [address: string]: SingleScriptAsset[];
  } = groupBy(
    withAddress,
    (entry) =>
      entry.address + entry.nativeScript.pkh + entry.nativeScript.unlockTime
  );

  // traverse each individual group and merge the assets field
  const mergedAssets: ScriptAssets[] = Object.values(groupedByAddress).map(
    (entries) =>
      entries.reduce(
        (acc: ScriptAssets, entry) => ({
          ...acc,
          assets: [...acc.assets, entry.asset],
        }),
        { ...entries[0], assets: [] }
      )
  );

  return mergedAssets;
};
