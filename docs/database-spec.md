# Cardashift vesting database requirements

## Types
```hs
data NativeScript = NativeScript
  { pkh :: String
  , unlockTime :: Integer
  }
-- To be converted to Lucids NativeScriptJSON Type, via https://github.com/Berry-Pool/lucid/blob/main/custom_modules/cardano-multiplatform-lib-nodejs/cardano_multiplatform_lib.js#L10749

data AssetClass = AssetClass
  { currencySymbol :: String
  , tokenName :: String -- As hex
  }

data LockedFund = LockedFund
  { nativeScript :: NativeScript
  , asset :: AssetClass
  }

type Address = String
-- In long text form - `addr1q...` etc.
```

## Input
Passed as a JSON file to Cardashift's team, in the following format:
```hs
Map Address [LockedFund]
```
Example:
```json
{
  "addr1wxaptpmxcxawvr3pzlhgnpmzz3ql43n2tc8mn3av5kx0yzs09tqh8": [
    {
      "nativeScript": {
        "pkh": "ec8c7d111c04761ef362a0036d36893e7f04adde4afd5ea3e1e85914",
        "unlockTime": 62681940
      },
      "asset": {
        "currencySymbol": "7b302af5758319058e3a282c424bf19adda9481372cf6e45fd33d0aa",
        "tokenName": "54686541706544616f32353338"
      }
    },
    ...
  ]
}
```

## Output (GET endpoint)
Input:
`/vesting/native-scripts/[Address]`

Output (as JSON):
```hs
[LockedFund]
```
Example:
```json
[
  {
    "nativeScript": {
      "pkh": "ec8c7d111c04761ef362a0036d36893e7f04adde4afd5ea3e1e85914",
      "unlockTime": 62681940
    },
    "asset": {
      "currencySymbol": "7b302af5758319058e3a282c424bf19adda9481372cf6e45fd33d0aa",
      "tokenName": "54686541706544616f32353338"
    }
  },
  ...
]
```
