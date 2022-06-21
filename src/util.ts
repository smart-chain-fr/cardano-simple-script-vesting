import { C, Lucid, PaymentKeyHash, UTxO } from "lucid-cardano";

export type ToClaim = {
  [key: string]: {
    nativeScript: { pkh: string; unlockTime: number };
    asset: { currencySymbol: string; tokenName: string };
  }[];
};

export const claimChecks =
  (lucid: Lucid) =>
  (
    pkh: PaymentKeyHash,
    unlockTime: number,
    assets: { currencySymbol: string; tokenName: string }
  ) =>
    [
      // unlock time check
      () => lucid.utils.unixTimeToSlot(Date.now()) > unlockTime,
      // assetlcass check
      (u: UTxO) => !!u.assets && !!assets,
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
