import { Lucid, Blockfrost, UTxO, Assets } from "lucid-cardano";
import { buildTimelockedNativeScript, claimChecks, ToClaim } from "./util";

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    cardano: any;
  }
}

const lookupAvailableFunds = (lucid: Lucid) => async (toClaim: ToClaim) => {
  const allUtxos = await Promise.all(
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

  const flattenedUtxos = allUtxos.reduce(
    (
      acc: {
        utxos: UTxO[];
        nativeScript: { pkh: string; unlockTime: number };
      }[],
      cur
    ) => cur.reduce((acc2, cur2) => [...acc2, cur2], acc),
    []
  );

  // const totalValueLocked = flattenedUtxos
  //   .map((x) => x.utxos.map((y) => y.assets))
  //   .flat()
  //   .reduce(
  //     (acc: Assets, cur: Assets) =>
  //       Object.entries(cur).reduce(
  //         (acc2: Assets, [a, v]) =>
  //           a in acc2
  //             ? { ...acc2, [a]: acc2[a].valueOf() + v.valueOf() }
  //             : { ...acc2, [a]: v },
  //         acc
  //       ),
  //     {}
  //   );

  // console.log(totalValueLocked);
  // console.log(flattenedUtxos);

  return flattenedUtxos.filter((x) => !!x.utxos.length);
};

const claimVestedFunds = (lucid: Lucid) => async (toClaim: ToClaim) => {
  const claimableUtxos = await lookupAvailableFunds(lucid)(toClaim);
  if (!claimableUtxos.length) throw Error("Nothing to claim");

  const natives = claimableUtxos.map((x) =>
    buildTimelockedNativeScript(x.nativeScript.unlockTime, x.nativeScript.pkh)
  );
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
    nativeScript: { pkh: string; unlockTime: number };
  }[]
) =>
  flattenedUtxos
    .map((x) => x.utxos.map((y) => y.assets))
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

const init = async (blockfrostUrl: string, projectId: string, pvk: string) => {
  const lucid = await Lucid.new(
    new Blockfrost(blockfrostUrl, projectId),
    "Testnet"
  );

  lucid.selectWalletFromPrivateKey(pvk);

  // For browser wallet:
  // const api = await window.cardano.nami.enable();
  // lucid.selectWallet(api);

  const getEndpointData = (): Promise<ToClaim> =>
    fetch("http://localhost:8000/data.json").then((r) => r.json());

  return {
    fundsAvailable: async (epData?: ToClaim) =>
      totalClaimableUtxos(
        await lookupAvailableFunds(lucid)(epData || await getEndpointData())
      ),
    claimFunds: async (epData?: ToClaim) => claimVestedFunds(lucid)(epData || await getEndpointData()),
  };
};

export default init;
