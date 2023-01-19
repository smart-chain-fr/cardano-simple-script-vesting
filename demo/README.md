/!\ Does not work /!\

This is a demo of the library that can be runned on NodeJS using a private key instead of a connexion to a browser wallet (Nami, Flint,...).

## Full Demo

The following video has been shot on the old Testnet. This written tutorial is for the Preprod network. The parameters are different but the steps are the same.
[**VIDEO**](https://drive.google.com/file/d/17Fnpus1X-_Vnj9Itx43HlAKZt4D-H0td/view?usp=sharing)

### Step 1: Generate keys
See [key-generation.md](../docs/key-generation.md).

### Step 2: Generate simple script and address
See [simple-script-generation.md](../docs/simple-script-generation.md).

### Step 3: Lock funds
Send funds to the generated address.

Note: You can get testnet ADA from the [faucet](https://docs.cardano.org/cardano-testnet/tools/faucet).

### Step 4: Get Blockfrost API key
Create a [Blockfrost](https://blockfrost.io/) account and create a "project" on a Testnet.
Replace the network and API key in the [config.js](./config.js) file.

### Step 4: Check available funds
Replace nativeScriptAddress, requireTimeAfterSlot, requireSignature and signingKey by the ones you generated in the previous steps in the [config.js](./config.js) file.
Then run `node check.js`

### Step 5: Claim Tx
If the previous step displays available funds, you can run the following command to claim them:
`node claim.js`

### Step 6: Inspect
You can use cardano-cli to query your address or an explorer to see the funds now in your wallet!
`cardano-cli query utxo --address $(cat shelley.addr) --testnet-magic 1`