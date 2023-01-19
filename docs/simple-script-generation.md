## Step 1: Simple script setup

#### First simple script (simpleScript1.json)
This script is set to unlock funds at slot 17317800 which is set in the past (at the time of testing)
simpleScript1.json
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
Note: Be careful, the order of the conditions is to be taken into account. Despite the logical meaning stays the same if we interchange the 2 conditions in the above script, the resulting Simple script will have a different hash, thus a different address on the blockchain.

#### Second simple script (simpleScript2.json)
This script is set to unlock funds at slot 17317800 which is set in the future (at the time of testing)
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
Note: To get the pubKeyHash see [get-pub-key-hash.md](./get-pub-key-hash.md).


#### Build the relevant addresses for the 2 simple scripts

`cardano-cli address build --payment-script-file simpleScript1.json --testnet-magic 1 --out-file simpleScript1.addr`
`cardano-cli address build --payment-script-file simpleScript2.json --testnet-magic 1 --out-file simpleScript2.addr`