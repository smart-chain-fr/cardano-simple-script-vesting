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
// init(
//     "https://cardano-testnet.blockfrost.io/api/v0",
//     "testnetLcLqm10CEnmMJEzLMtp7w3MtaxhKKE13",
//     12344321,
//     // bech32 ed25519_sk <<< 8af9e38b29a81119ffbf5f857a12d922fb31987f04f24b4f18b6744fe2744921
//     //                       ^^ cborHex
//     "ed25519_sk13tu78zef4qg3nlalt7zh5ykeytanrxrlqneyknccke6ylcn5fysswsaeys"
// ).then((r) => r.claimFunds("3b1cc33f9b730292484cd21882f3057a6ff11276ba9a31a831e18cbf"));

describe("Sample Test Suite", () => {
  it("Sample Test", () => {
    expect(true).toBe(true)

  });
});
