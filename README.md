## Usage

### Installation
```
npm install cardashift-lucid-contracts
```

### Initialisation

To use the utilit, first instantiate the class with the following parameters:
* `network` : Network to run. `Testnet` and `Mainnet` currently supported.
* `walletProvider` : A browser wallet provider (`nami`,`flint`,`eternal` etc.) or
  a bech32 encoded payment signing key (short: `ed25519_sk1...` or extended: `ed25519e_sk1...`). Note that Lucid doesn't provide support for importing staking signing keys so you cannot load a wallet for a "long" (base) address (eg. `addr_test1qpluggdj3uf3prtczppgvu4nexgxzmzmpckzjs8v9jyqxpvz2l3xlg3k42ss7m55e94r62ctwc0awhh02jtcf60qrg0sxppnvm`). If you only provide the payment signing key for this address, Lucid will load the wallet with the following address `addr_test1vpluggdj3uf3prtczppgvu4nexgxzmzmpckzjs8v9jyqxpg3pq80m`.
* `apiKey` : A blockfrost apiKey/projectId


sample call:
```js
import Claim, { selectWalletProvider, networkName } from "cardashift-lucid-contracts";
import config from "../config";

const wProvider = await selectWalletProvider("nami");
const claim = new Claim(networkName(config.network), wProvider, config.apiKey);
```
Note here that we have put the config in another file `config.ts`:
```js
export default {
    network: "Testnet",
    apiKey: "testnetLcLqm10CEnmMJEzLMtp7w3MtaxhKKE13",
  }

```

### Exposed objects

`default export` takes the mentioned parameters to instantiate the `Claim` class, which exposes the following methods :

* `fundsAvailable`: A function that takes a `toClaim` object  and returns the total amount of assets that can be claimed at that point in time.

* `claimFunds`: A function that builds a transaction claiming the total amount of claimable assets

`selectWalletProvider`: A function that takes a string representing a browser wallet provider (`nami`,`flint`,`eternal` etc.) or
  a bech32 encoded signing key (short: `ed25519_sk1...` or extended: `ed25519e_sk1...`) and resolves to a `WalletProvider`

`networkName`: A function that takes a string representing a network (`Testnet` and `Mainnet` currently supported) and resolves to a `Network`

Example call:
```js
      const toClaim = {
        // native1
        addr_test1wplllmmv66873lu9fxvralrddql5pxqg9ws8wvy4tz7gquqnyhmwk: [
          {
            nativeScript: {
              requireTimeAfterSlot: 61302000,
              requireSignature: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8",
            },
            asset: { currencySymbol: "", tokenName: "" },
          },
        ],
        // native2
        addr_test1wr4s67h09peh3ssrx95l5k5rlfzw4ez4x2hlsuf6m4pwukc87xd44: [
          {
            nativeScript: {
              requireTimeAfterSlot: 61310000,
              requireSignature: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8",
            },
            asset: { currencySymbol: "", tokenName: "" },
          },
        ],
      };

      claim.fundsAvailable(toClaim).then(console.log); // or claimFunds(toClaim)

```
