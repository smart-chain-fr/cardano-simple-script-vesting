## Get pub key hash

#### From a payment verification key file generated with cardano-cli (cf [key-generation.md](./key-generation.md))
`cardano-cli address key-hash --payment-verification-key-file ./shelley.vkey --out-file shelley.pkh`
`> 33fe2494e35ba59963658aaa04e2868e9be57c9ac69b46f11172536b`

#### From an address (using cardano-address)
`echo "addr_test1vqelufy5udd6txtrvk925p8zs68fhetuntrfk3h3z9e9x6c3yj49l" | cardano-address address inspect`
```bash
>{
    "stake_reference": "none",
    "spending_key_hash_bech32": "addr_vkh1x0lzf98rtwjejcm9324qfc5x36d72ly6c6d5dug3wffkkgkcvd3",
    "address_style": "Shelley",
    "spending_key_hash": "33fe2494e35ba59963658aaa04e2868e9be57c9ac69b46f11172536b",
    "network_tag": 0
 }
```