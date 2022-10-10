## Full Demo

[**VIDEO**](https://drive.google.com/file/d/17Fnpus1X-_Vnj9Itx43HlAKZt4D-H0td/view?usp=sharing)

### Step 1: Generate native script


### Step 2: Lock funds
* [50 tAda -> native1](https://testnet.cardanoscan.io/transaction/a0e0c731711d5e5199ccbe988d7460c1be54e69cad4d99718bfa278a7950ec56)
* [50 tAda -> native1](https://testnet.cardanoscan.io/transaction/c99953d66e7c388463680378ef0fcfd44f24c419ed776099cfe50d482761ae0f)
* [30 tAda -> native2](https://testnet.cardanoscan.io/transaction/0a755e9b0072ac72e2245ec171f5c69b7f32d918a3517655c9c7c333f57ca08a)


##### Query utxos at native script addresses
* native1 has 2 utxos locked (50 tAda each)

`cardano-cli query utxo --address $(cat native1.addr) --testnet-magic 1097911063`

* native2 has 1 utxo locked (30 tAda)

`cardano-cli query utxo --address $(cat native2.addr) --testnet-magic 1097911063`

### Step 3: Claim Tx

> **NOTE**: The demo js code requires blockfrost apiKey and claimant's wallet signing key as it's
running in a NodeJS environment. The final product only requires a wallet
provider to be initialized.

```js
import Claim from "cardashift-lucid-contracts"
import config from "./config.js"

const toClaim = {
  // native1
  addr_test1wplllmmv66873lu9fxvralrddql5pxqg9ws8wvy4tz7gquqnyhmwk: [{
    nativeScript: {
      requireTimeAfterSlot: 61302000,
      requireSignature: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8"
    },
    asset: { currencySymbol: "", tokenName: "" },
  }],
  // native2
  addr_test1wr4s67h09peh3ssrx95l5k5rlfzw4ez4x2hlsuf6m4pwukc87xd44: [{
    nativeScript: {
      requireTimeAfterSlot: 61310000,
      requireSignature: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8"
    },
    asset: { currencySymbol: "", tokenName: "" },
  }]
}
const wProvider = await selectWalletProvider("ed25519_sk1mp6a28k5423ttwny08362fl8dx2dtm4r2vyy0n83kpvny94hxzhqw96eru");
const claim = new Claim(networkName(config.network), wProvider, config.apiKey);
const txHash = await claim.claimTokens(toClaim);
console.log(txHash);
```


### Step 5: Inspect

* [~100 tAda -> shelley.addr](https://testnet.cardanoscan.io/transaction/8a9ba9d5304fccfe0fc9039c63cabcfe839d145535f991b0073a2785dc096dbe)

`cardano-cli query utxo --address $(cat shelley.addr) --testnet-magic 1097911063`