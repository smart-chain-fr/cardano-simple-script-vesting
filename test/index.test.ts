// import fc from "fast-check";
import init from "../src/index";
import { mnemonicToEntropy } from "bip39";
import { C } from "lucid-cardano";

const entropy = mnemonicToEntropy(
  "slow bonus employ over frequent clip derive burst quit chase language rhythm enough fruit calm airport subway mother captain mango visual shoot invest name"
);

const rootKey = C.Bip32PrivateKey.from_bip39_entropy(
  Buffer.from(entropy, "hex"),
  Buffer.from("")
);

function harden(num: number): number {
  return 0x80000000 + num;
}

describe("Sample Test Suite", () => {
  it("Sample Test", async () => {
    return init(
      "https://cardano-testnet.blockfrost.io/api/v0",
      "testnetLcLqm10CEnmMJEzLMtp7w3MtaxhKKE13",
      12344321,
      rootKey
        .derive(harden(1852)) // purpose
        .derive(harden(1815)) // coin type
        .derive(harden(0))
        .derive(0)
        .derive(0)
        .to_bech32() // account #0,
    ).then((r) => r.lockTest());
  });
});
