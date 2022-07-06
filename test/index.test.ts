import init from "../src";
import {groupByScript} from "../src/util"
import config from "../config";

describe("Sample Test Suite", () => {
  it("Tests groupByScript correctness", () => {
    const epData = {
        // native1
        addr_test1wplllmmv66873lu9fxvralrddql5pxqg9ws8wvy4tz7gquqnyhmwk: [
          {
            nativeScript: {
              unlockTime: 61302000,
              pkh: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8",
            },
            asset: { currencySymbol: "", tokenName: "" },
          },
          {
            nativeScript: {
              unlockTime: 61302000,
              pkh: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8",
            },
            asset: {
              currencySymbol:
                "b07de2ce2a86f890410d4504d491b1df423f7e3e20973663a819d1a1",
              tokenName: "455448",
            },
          },
        ],
        // native2
        addr_test1wr4s67h09peh3ssrx95l5k5rlfzw4ez4x2hlsuf6m4pwukc87xd44: [
          {
            nativeScript: {
              unlockTime: 61310000,
              pkh: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8",
            },
            asset: { currencySymbol: "", tokenName: "" },
          },
        ],
      };

    const groupedByScript = groupByScript(epData);
    expect(groupedByScript).toHaveLength(Object.keys(epData).length);
  })

  it.skip("Tests that lookupAvailableFunds returns the right assets and values", async () => {
    const funds = await init(
      config.url,
      config.apiKey,
      "ed25519_sk1mp6a28k5423ttwny08362fl8dx2dtm4r2vyy0n83kpvny94hxzhqw96eru"
    ).then(({ fundsAvailable }) => {
      const epData = {
        // native1
        addr_test1wplllmmv66873lu9fxvralrddql5pxqg9ws8wvy4tz7gquqnyhmwk: [
          {
            nativeScript: {
              unlockTime: 61302000,
              pkh: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8",
            },
            asset: { currencySymbol: "", tokenName: "" },
          },
        ],
        // native2
        addr_test1wr4s67h09peh3ssrx95l5k5rlfzw4ez4x2hlsuf6m4pwukc87xd44: [
          {
            nativeScript: {
              unlockTime: 61310000,
              pkh: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8",
            },
            asset: { currencySymbol: "", tokenName: "" },
          },
        ],
      };

      return fundsAvailable(epData);
    });
    expect(funds.lovelace.toString()).toBe("120000000");
  });

  it("Tests that claimFunds is able to claims the given funds", async () => {
    const txHash = await init(
      config.url,
      config.apiKey,
      "ed25519_sk1mp6a28k5423ttwny08362fl8dx2dtm4r2vyy0n83kpvny94hxzhqw96eru"
    ).then(({ claimFunds }) => {
      const epData = {
        // native1
        addr_test1wplllmmv66873lu9fxvralrddql5pxqg9ws8wvy4tz7gquqnyhmwk: [
          {
            nativeScript: {
              unlockTime: 61302000,
              pkh: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8",
            },
            asset: { currencySymbol: "", tokenName: "" },
          },
        ],
        // native2
        addr_test1wr4s67h09peh3ssrx95l5k5rlfzw4ez4x2hlsuf6m4pwukc87xd44: [
          {
            nativeScript: {
              unlockTime: 61310000,
              pkh: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8",
            },
            asset: { currencySymbol: "", tokenName: "" },
          },
        ],
      };

      return claimFunds(epData);
    });

    console.log(txHash)

    expect(txHash).toBeTruthy();
    expect(typeof txHash).toBe('string');
  });
});
