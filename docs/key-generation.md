## Key generation

> **NOTE**: This step is only needed for the purposes of the demo and running the code in
a NodeJS environment. It is not required if the library is used in a browser
environment in conjunction with a wallet provider.

#### Generate key pair
`cardano-cli address key-gen --verification-key-file ./shelley.vkey --signing-key-file ./shelley.skey`
#### Build addresses
`cardano-cli address build --payment-verification-key-file ./shelley.vkey --out-file ./shelley.addr --testnet-magic 1`
`> addr_test1vqelufy5udd6txtrvk925p8zs68fhetuntrfk3h3z9e9x6c3yj49l`

#### Encode skey into bech 32
Get the cborHex signing key from shelley.skey.
`cat shelley.skey`
```
> {
    "type": "PaymentSigningKeyShelley_ed25519",
    "description": "Payment Signing Key",
    "cborHex": "58202fd8752a712e2a47ff0b581d67a4b20ffc48f8088d1bb959f7fcd0a46221b8ec"
  }
```

The cborhex here contains 2 parts:
1. prefix 5820 - bytestring of 32 bytes
2. signing key (64 bytes) - 2fd8752a712e2a47ff0b581d67a4b20ffc48f8088d1bb959f7fcd0a46221b8ec

Rule for prefixes:
  - CBOR-encoded bytestring (which is what the 58 identifies)
  - size (80 means 128 bytes, whereas 40 means 64 bytes, 20 means 32 bytes)

`bech32 ed25519_sk <<< 2fd8752a712e2a47ff0b581d67a4b20ffc48f8088d1bb959f7fcd0a46221b8ec`
`> ed25519_sk19lv822n39c4y0lcttqwk0f9jpl7y37qg35dmjk0hlng2gc3phrkqy42590`
