## Step 1: Native script setup

#### First native script (native1.json)
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

#### Second native script (native2.json)
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
Note: To get the pubKeyHash see [key-generation.md](./key-generation.md).


#### Build the relevant addresses for the 2 native scripts

`cardano-cli address build --payment-script-file native1.json --testnet-magic 1097911063 --out-file native1.addr`
`cardano-cli address build --payment-script-file native2.json --testnet-magic 1097911063 --out-file native2.addr`