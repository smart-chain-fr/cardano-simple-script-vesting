import {
  Lucid,
  Blockfrost,
  UTxO,
  Assets,
  Network,
  WalletProvider,
} from "lucid-cardano";
import {
  buildTimelockedNativeScript,
  claimChecks,
  deduplicateUtxosReducer,
  groupByScript,
  ToClaim,
} from "./util";

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    cardano: any;
  }
}

const lookupAvailableFunds = (lucid: Lucid) => async (toClaim: ToClaim) => {
  const groupedByScript = groupByScript(toClaim);;

  const addressesWithUtxos = await Promise.all(groupedByScript.map(async (x) => {
    const utxos = await lucid.utxosAt(x.address);

    const predicates = claimChecks(lucid)(x.nativeScript.pkh,x.nativeScript.unlockTime,x.assets);

    const claimableUtxos = utxos.filter((x) => predicates.every((p) => p(x)));

    return {
      utxos: claimableUtxos,
      nativeScript: x.nativeScript,
      address: x.address,
    };
  }));

  return addressesWithUtxos.filter((x) => !!x.utxos.length);
};

const claimVestedFunds = (lucid: Lucid) => async (toClaim: ToClaim) => {
  const claimableUtxos = await lookupAvailableFunds(lucid)(toClaim);

  if (!claimableUtxos.length) throw Error("Nothing to claim");

  // console.log(claimableUtxos.map((x) => x.nativeScript));

  const natives = claimableUtxos.map((x) =>
    buildTimelockedNativeScript(x.nativeScript.unlockTime, x.nativeScript.pkh)
  );

  const tx = lucid
    .newTx()
    .collectFrom(claimableUtxos.map((x) => x.utxos).flat())

  natives.forEach((n) => tx.txBuilder.add_native_script(n));

  const txScriptAttached = await tx.validFrom(Date.now() - 100000).complete();

  const signed = await txScriptAttached.sign().complete();

  console.log(signed.txSigned.to_json());

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

/**
 * Initialise the library and expose lib API
 * @param {string} blockfrostUrl Blockfrost API URL
 * @param {string} apiKey Blockfrost API Key
 * @param wallet Either bech32 encoded signing key or a browser wallet provider.
 * @param {string} [network]
 * @namespace cardashift-lucid-contracts
 */
const init = async (
  blockfrostUrl: string,
  apiKey: string,
  wallet: string | WalletProvider,
  network: Network = "Testnet"
) => {
  const lucid = await Lucid.new(new Blockfrost(blockfrostUrl, apiKey), network);

  if (wallet.startsWith("ed25519")) {
    lucid.selectWalletFromPrivateKey(wallet);
  } else {
    // For browser wallet:
    lucid.selectWallet(wallet);
  }

  const getEndpointData = (): Promise<ToClaim> =>
    fetch("http://localhost:8000/data.json").then((r) => r.json());

  return {
    /**
     * Query and return available funds that can be claimed optionally based on
     * given claim data, otherwise fetches claim data from configured endpoint otherwise.
     * @memberof cardashift-lucid-contracts
     */
    fundsAvailable: async (epData?: ToClaim) =>
      totalClaimableUtxos(
        await lookupAvailableFunds(lucid)(epData || (await getEndpointData()))
      ),
    /**
     * Claim available funds optionally from given claim data when param is
     * provided, otherwise request claim data from configured endpoint.
     * @memberof cardashift-lucid-contracts
     * @param {ToClaim} [epData] Optional endpoint data to claim from
     */
    claimFunds: async (epData?: ToClaim) =>
      claimVestedFunds(lucid)(epData || (await getEndpointData())),
  };
};

export default init;
