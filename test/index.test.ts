import init from "../src";
import config from "../config";

describe("Sample Test Suite", () => {
  it("Sample Test", async () => {
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

    expect(funds.lovelace.toString()).toBe("30000000");
  });
});
