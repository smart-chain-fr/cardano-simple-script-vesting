import { C, Lucid, PaymentKeyHash, UTxO, Assets } from "lucid-cardano";

type ScriptAssets = {
  address: string;
  nativeScript: { requireSignature: string; requireTimeAfterSlot: number };
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
    nativeScript: { requireSignature: string; requireTimeAfterSlot: number };
    asset: { currencySymbol: string; tokenName: string };
  }[];
};

const deduplicateUtxosReducer = (
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

const claimChecks =
  (lucid: Lucid) =>
  (
    requireSignature: PaymentKeyHash,
    requireTimeAfterSlot: number,
    assets: { currencySymbol: string; tokenName: string }[]
  ) =>
     [
      // unlock time check
      () => lucid.utils.unixTimeToSlot(Date.now()) > requireTimeAfterSlot,
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
      () => !!requireSignature,
    ];


const buildTimelockedNativeScript = (requireTimeAfterSlot: number, requireSignature: string) => {
  const ns = C.NativeScripts.new();

  ns.add(
    C.NativeScript.new_timelock_start(
      C.TimelockStart.new(C.BigNum.from_str(requireTimeAfterSlot.toString()))
    )
  );
  ns.add(
    C.NativeScript.new_script_pubkey(
      C.ScriptPubkey.new(C.Ed25519KeyHash.from_hex(requireSignature))
    )
  );

  const scriptAll = C.ScriptAll.new(ns);
  return C.NativeScript.new_script_all(scriptAll);
};

export const groupByScript = (toClaim: ToClaim): ScriptAssets[] => {
  // flattened entries into an array of native script with address as field
  type SingleScriptAsset = {
    nativeScript: { requireSignature: string; requireTimeAfterSlot: number };
    asset: { currencySymbol: string; tokenName: string };
    address: string;
  };

  const withAddress: SingleScriptAsset[] = Object.entries(toClaim)
    .map(([address, entries]) =>
      entries.map((entry) => ({ address, ...entry }))
    )
    .flat();

  // groups native scripts by address and native script (requireSignature and requireTimeAfterSlot)
  // This is to extract unique products of the form { address, nativeScript }
  const groupedByAddress: {
    [address: string]: SingleScriptAsset[];
  } = groupBy(
    withAddress,
    (entry) =>
      entry.address + entry.nativeScript.requireSignature + entry.nativeScript.requireTimeAfterSlot
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

export const lookupAvailableFunds =
  (lucid: Lucid) => async (toClaim: ToClaim) => {
    const groupedByScript = groupByScript(toClaim);

    const addressesWithUtxos = await Promise.all(
      groupedByScript.map(async (x) => {
        const utxos = await lucid.utxosAt(x.address);

        const predicates = claimChecks(lucid)(
          x.nativeScript.requireSignature,
          x.nativeScript.requireTimeAfterSlot,
          x.assets
        );

        const claimableUtxos = utxos.filter((u) => predicates.every((p) => p(u)));
        return {
          utxos: claimableUtxos,
          nativeScript: x.nativeScript,
          address: x.address,
        };
      })
    );

    return addressesWithUtxos.filter((x) => !!x.utxos.length);
  };

export const totalClaimableUtxos = (
  flattenedUtxos: {
    utxos: UTxO[];
    nativeScript: { requireSignature: string; requireTimeAfterSlot: number };
  }[]
) =>
  {
    const res = flattenedUtxos
    .reduce(deduplicateUtxosReducer, [])
    .map((x) => x.assets)
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
    return res;
  }


export const claimVestedFunds = (lucid: Lucid) => async (toClaim: ToClaim) => {
  const claimableUtxos = await lookupAvailableFunds(lucid)(toClaim);

  if (!claimableUtxos.length) throw Error("Nothing to claim");

  const natives = claimableUtxos.map((x) =>
    buildTimelockedNativeScript(x.nativeScript.requireTimeAfterSlot, x.nativeScript.requireSignature)
  );

  const tx = lucid
    .newTx()
    .collectFrom(claimableUtxos.map((x) => x.utxos).flat())
    .payToAddress(
      await lucid.wallet.address(),
      totalClaimableUtxos(claimableUtxos)
    );

  natives.forEach((n) => tx.txBuilder.add_native_script(n));

  const txScriptAttached = await tx.validFrom(Date.now() - 100000).complete();

  const signed = await txScriptAttached.sign().complete();

  const txHash = await signed.submit();
  return txHash;
};
