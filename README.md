## Sample usage

### Step 1: Setup


`cardano-cli address key-gen --verification-key-file ./shelley.vkey --signing-key-file ./shelley.skey`
`cardano-cli address build --payment-verification-key-file ./shelley.vkey --out-file ./shelley.addr --testnet-magic 1097911063`
`cardano-cli address key-hash --payment-verification-key-file ./shelley.vkey --out-file shelley.pkh`

`cat shelley.skey`
`bech32 ed25519_sk <<< d875d51ed4aaa2b5ba6479e3a527e76994d5eea3530847ccf1b0593216b730ae`

write to shelley-bech32.skey

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

native2.json
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


`cardano-cli address build --payment-script-file native1.json --testnet-magic 1097911063 --out-file native1.addr`
`cardano-cli address build --payment-script-file native2.json --testnet-magic 1097911063 --out-file native2.addr`



### Step 2: Lock funds
50 tAda -> native1
https://testnet.cardanoscan.io/transaction/a0e0c731711d5e5199ccbe988d7460c1be54e69cad4d99718bfa278a7950ec56
50 tAda -> native1
https://testnet.cardanoscan.io/transaction/c99953d66e7c388463680378ef0fcfd44f24c419ed776099cfe50d482761ae0f
30 tAda -> native2
https://testnet.cardanoscan.io/transaction/0a755e9b0072ac72e2245ec171f5c69b7f32d918a3517655c9c7c333f57ca08a


`cardano-cli query utxo --address $(cat native1.addr) --testnet-magic 1097911063`
`cardano-cli query utxo --address $(cat native2.addr) --testnet-magic 1097911063`

### Step 3: Claim Tx


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

https://testnet.cardanoscan.io/transaction/8a9ba9d5304fccfe0fc9039c63cabcfe839d145535f991b0073a2785dc096dbe

`cardano-cli query utxo --address $(cat shelley.addr) --testnet-magic 1097911063`



# TSDX User Guide

Congrats! You just saved yourself hours of work by bootstrapping this project with TSDX. Let’s get you oriented with what’s here and how to use it.

> This TSDX setup is meant for developing libraries (not apps!) that can be published to NPM. If you’re looking to build a Node app, you could use `ts-node-dev`, plain `ts-node`, or simple `tsc`.

> If you’re new to TypeScript, checkout [this handy cheatsheet](https://devhints.io/typescript)

## Commands

TSDX scaffolds your new library inside `/src`.

To run TSDX, use:

```bash
npm start # or yarn start
```

This builds to `/dist` and runs the project in watch mode so any edits you save inside `src` causes a rebuild to `/dist`.

To do a one-off build, use `npm run build` or `yarn build`.

To run tests, use `npm test` or `yarn test`.

## Configuration

Code quality is set up for you with `prettier`, `husky`, and `lint-staged`. Adjust the respective fields in `package.json` accordingly.

### Jest

Jest tests are set up to run with `npm test` or `yarn test`.

### Bundle Analysis

[`size-limit`](https://github.com/ai/size-limit) is set up to calculate the real cost of your library with `npm run size` and visualize the bundle with `npm run analyze`.

#### Setup Files

This is the folder structure we set up for you:

```txt
/src
  index.tsx       # EDIT THIS
/test
  blah.test.tsx   # EDIT THIS
.gitignore
package.json
README.md         # EDIT THIS
tsconfig.json
```

### Rollup

TSDX uses [Rollup](https://rollupjs.org) as a bundler and generates multiple rollup configs for various module formats and build settings. See [Optimizations](#optimizations) for details.

### TypeScript

`tsconfig.json` is set up to interpret `dom` and `esnext` types, as well as `react` for `jsx`. Adjust according to your needs.

## Continuous Integration

### GitHub Actions

Two actions are added by default:

- `main` which installs deps w/ cache, lints, tests, and builds on all pushes against a Node and OS matrix
- `size` which comments cost comparison of your library on every pull request using [`size-limit`](https://github.com/ai/size-limit)

## Optimizations

Please see the main `tsdx` [optimizations docs](https://github.com/palmerhq/tsdx#optimizations). In particular, know that you can take advantage of development-only optimizations:

```js
// ./types/index.d.ts
declare var __DEV__: boolean;

// inside your code...
if (__DEV__) {
  console.log('foo');
}
```

You can also choose to install and use [invariant](https://github.com/palmerhq/tsdx#invariant) and [warning](https://github.com/palmerhq/tsdx#warning) functions.

## Module Formats

CJS, ESModules, and UMD module formats are supported.

The appropriate paths are configured in `package.json` and `dist/index.js` accordingly. Please report if any issues are found.

## Named Exports

Per Palmer Group guidelines, [always use named exports.](https://github.com/palmerhq/typescript#exports) Code split inside your React app instead of your React library.

## Including Styles

There are many ways to ship styles, including with CSS-in-JS. TSDX has no opinion on this, configure how you like.

For vanilla CSS, you can include it at the root directory and add it to the `files` section in your `package.json`, so that it can be imported separately by your users and run through their bundler's loader.

## Publishing to NPM

We recommend using [np](https://github.com/sindresorhus/np).
