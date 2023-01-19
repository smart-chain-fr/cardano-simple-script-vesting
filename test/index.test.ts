import Claim, { networkName, selectWalletProvider } from "../src";

const prvKey =
  "ed25519_sk1mp6a28k5423ttwny08362fl8dx2dtm4r2vyy0n83kpvny94hxzhqw96eru";
const network = "Testnet";
const blockfrostApiKey = "testnetLcLqm10CEnmMJEzLMtp7w3MtaxhKKE13";

describe("Sample Test Suite", () => {
  it("Tests that lookupAvailableFunds returns the right assets and values", async () => {
    const wProvider = await selectWalletProvider(prvKey);
    const claim = new Claim(networkName(network), wProvider, blockfrostApiKey);
    const epData = [
      {
        // native1
        address: "addr_test1wplllmmv66873lu9fxvralrddql5pxqg9ws8wvy4tz7gquqnyhmwk",
        nativeScript: {
          requireTimeAfterSlot: 61302000,
          requireSignature: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8",
        },
        assets: [
          { currencySymbol: "", tokenName: "" },
        ]
      },
      {
        // native2
        address: "addr_test1wr4s67h09peh3ssrx95l5k5rlfzw4ez4x2hlsuf6m4pwukc87xd44",
        nativeScript: {
          requireTimeAfterSlot: 61310000,
          requireSignature: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8",
        },
        assets: [
          { currencySymbol: "", tokenName: "" },
        ]
      }
    ];
    const funds = await claim.fundsAvailable(epData);
    expect(funds.lovelace.toString()).toBe("50000000");
  });

  it.skip("Tests that claimFunds is able to claims the given funds", async () => {
    const wProvider = await selectWalletProvider(prvKey);
    const claim = new Claim(networkName(network), wProvider, blockfrostApiKey);
    const epData = [
      {
        // native1
        address: "addr_test1wplllmmv66873lu9fxvralrddql5pxqg9ws8wvy4tz7gquqnyhmwk",
        nativeScript: {
          requireTimeAfterSlot: 61302000,
          requireSignature: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8",
        },
        assets: [
          { currencySymbol: "", tokenName: "" },
        ]
      },
      {
        // native2
        address: "addr_test1wr4s67h09peh3ssrx95l5k5rlfzw4ez4x2hlsuf6m4pwukc87xd44",
        nativeScript: {
          requireTimeAfterSlot: 61310000,
          requireSignature: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8",
        },
        assets: [
          { currencySymbol: "", tokenName: "" },
        ]
      }
    ];
    const txHash = claim.claimFunds(epData);
    expect(txHash).toBeTruthy();
    expect(typeof txHash).toBe("string");
  });
});
