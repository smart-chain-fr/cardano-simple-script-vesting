# cardano-simple-script-vesting

This library is part of a suite of products for [Cardashift's launchpad](https://cardashift.com/) as a first and easy implementation of a vesting contract using [Cardano Simple Scripts](https://github.com/input-output-hk/cardano-node/blob/master/doc/reference/simple-scripts.md)(aka Native Script). The goal is to lock tokens related to Private Sales' investors and Cardashift's accounts (Treasury, Team, Advisors,...).

The library uses [lucid-cardano](https://www.npmjs.com/package/lucid-cardano).
As for now, this library is only used to check available tokens to be claimed at a Simple Script address and claim them. The locking Simple Script enforces 2 conditions:
- an unlock time (expressed in slot number)
- a pubKeyHash of the tokens owner
The Simple Script is of the form:
```json
{
  "type": "all",
  "scripts":
  [
    {
      "type": "sig",
      "keyHash": "33fe2494e35ba59963658aaa04e2868e9be57c9ac69b46f11172536b"
    },
    {
      "type": "after",
      "slot": 17317800
    }
  ]
}

```

## Usage

### Installation
```
npm install cardano-simple-script-vesting
```

### Initialisation

To use the utilit, first instantiate the class with the following parameters:
* `network` : Network to run. `Mainnet`, `Preprod` and `Preview` currently supported.
* `walletProvider` : A browser wallet provider (`nami`,`flint`,`eternal` etc.) or a bech32 encoded payment signing key (short: `ed25519_sk1...` or extended: `ed25519e_sk1...`).
* `apiKey` : A blockfrost apiKey/projectId

Note 1: Lucid doesn't provide support for importing payment signing key + staking signing keys, so you cannot load a wallet for a "long" (base) address.
        e.g. Long address: `addr_test1qpluggdj3uf3prtczppgvu4nexgxzmzmpckzjs8v9jyqxpvz2l3xlg3k42ss7m55e94r62ctwc0awhh02jtcf60qrg0sxppnvm`
             If you only provide the payment signing key for this address, Lucid will load the wallet with the following address `addr_test1vpluggdj3uf3prtczppgvu4nexgxzmzmpckzjs8v9jyqxpg3pq80m`.
        However, everything is fine if you load a wallet from a browser wallet provider (which is the most frequent case).

Note 2: For keys derivation and script generation you can refer to [docs](docs) and [keys-and-scripts-examples](keys-and-scripts-examples).

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
    network: "Preprod",
    apiKey: "preprodLcLqm10CEnmMJEzLMtp7w3MtaxhKKE13",
  }

```

### Exposed objects

`default export` takes the mentioned parameters to instantiate the `Claim` class, which exposes the following methods :

* `fundsAvailable`: A function that takes a `ScriptAssets[]` object  and returns the total amount of assets that can be claimed at that point in time.

* `claimFunds`: A function that builds a transaction claiming the total amount of claimable assets

`selectWalletProvider`: A function that takes a string representing a browser wallet provider (`nami`,`flint`,`eternal` etc.) or
  a bech32 encoded signing key (short: `ed25519_sk1...` or extended: `ed25519e_sk1...`) and resolves to a `WalletProvider`

`networkName`: A function that takes a string representing a network (`Mainnet`, `Preprod` and `Preview` currently supported) and resolves to a `Network`

Example call:
```js
      const toClaim = [
        {
          // native1
          address: "addr_test1wq8pmhtxwuzdnfu3mqsvden7mrhgkw2lcv54tyvgnusskjcdwjeg3",
          nativeScript: {
            requireTimeAfterSlot: 17317800,
            requireSignature: "d1e3f14070d32f2b3e167417f0ecbf77328f5520ca7aa6e0fb904c60",
          },
          assets: [
            { currencySymbol: "3450cad5f6a513eefc5e1a91cbeddf5657bb9b21354e7903983cd777", tokenName: "74434c4150" },
          ]
        },
        {
          // native2
          address: "addr_test1wq03hjpm3qua770v02zmhkcfk6u7fxjxqly5aeequeaw4dgu6xa3z",
          nativeScript: {
            requireTimeAfterSlot: 17321400,
            requireSignature: "d1e3f14070d32f2b3e167417f0ecbf77328f5520ca7aa6e0fb904c60",
          },
          assets: [
            { currencySymbol: "3450cad5f6a513eefc5e1a91cbeddf5657bb9b21354e7903983cd777", tokenName: "74434c4150" },
          ]
        }
      ];

      claim.fundsAvailable(toClaim).then(console.log); // or claimFunds(toClaim)

```

## Integration example
You have an example using NodeJS in [demo](./demo/).
Otherwise, you can check the repo [vesting-lib-integration-mock](https://github.com/cardashift/vesting-lib-integration-mock) for interacting with a Nami wallet.