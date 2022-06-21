## Sample usage

### Step 1: Setup

> **NOTE**: The setup step is only for the purposes of the demo and running the code in
a NodeJS environment. It is not required if the library is used in a browser
in conjunction with a wallet provider.**


##### Generate key pair
`cardano-cli address key-gen --verification-key-file ./shelley.vkey --signing-key-file ./shelley.skey`
##### Build addresses
`cardano-cli address build --payment-verification-key-file ./shelley.vkey --out-file ./shelley.addr --testnet-magic 1097911063`
##### Get payment key hash
`cardano-cli address key-hash --payment-verification-key-file ./shelley.vkey --out-file shelley.pkh`

##### Encode skey into bech 32
`bech32 ed25519_sk <<< d875d51ed4aaa2b5ba6479e3a527e76994d5eea3530847ccf1b0593216b730ae`

##### First native script (native1.json)
This script is set to unlock funds at slot 61302000 which is set in the past (at the time of testing)
native1.json
```json
{
  "type": "all",
  "scripts":
  [
    {
      "type": "after",
      "slot": 61302000
    },
    {
      "type": "sig",
      "keyHash": "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8"
    }
  ]
}

```

##### First native script (native2.json)
This script is set to unlock funds at slot 61310000 which is set in the future (at the time of testing)
```json
{
  "type": "all",
  "scripts":
  [
    {
      "type": "after",
      "slot": 61310000
    },
    {
      "type": "sig",
      "keyHash": "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8"
    }
  ]
}

```


##### Build the relevant addresses for the 2 native scripts

`cardano-cli address build --payment-script-file native1.json --testnet-magic 1097911063 --out-file native1.addr`
`cardano-cli address build --payment-script-file native2.json --testnet-magic 1097911063 --out-file native2.addr`



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

> **NOTE**: This demo code requires blockfrost url, apiKey and claimant's wallet signing key as it's
running in a NodeJS environment. The final product only requires a wallet
provider to be initialized.

```js
import init from "cardashift-lucid-contracts"
import config from "./config.js"

init(
  config.url, // blockfrost testnet url
  config.apiKey, // blockfrost testnet apikey
  "ed25519_sk1mp6a28k5423ttwny08362fl8dx2dtm4r2vyy0n83kpvny94hxzhqw96eru")
  .then(({ claimFunds, fundsAvailable}) => {
    const epData = {
      // native1
      addr_test1wplllmmv66873lu9fxvralrddql5pxqg9ws8wvy4tz7gquqnyhmwk: [{
        nativeScript: {
          unlockTime: 61302000,
          pkh: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8"
        },
        asset: { currencySymbol: "", tokenName: "" },
      }],
      // native2
      addr_test1wr4s67h09peh3ssrx95l5k5rlfzw4ez4x2hlsuf6m4pwukc87xd44: [{
        nativeScript: {
          unlockTime: 61310000,
          pkh: "404b36ba72b1e6602d33ad069ef25d8b65757c8d728e02aa1a280cd8"
        },
        asset: { currencySymbol: "", tokenName: "" },
      }]
    }

    claimFunds(epData).then(console.log);
  })
```


### Step 5: Inspect

* [~100 tAda -> shelley.addr](https://testnet.cardanoscan.io/transaction/8a9ba9d5304fccfe0fc9039c63cabcfe839d145535f991b0073a2785dc096dbe)

`cardano-cli query utxo --address $(cat shelley.addr) --testnet-magic 1097911063`

