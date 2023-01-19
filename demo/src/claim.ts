import config from "../config";
import Claim, { selectWalletProvider, networkName } from "cardano-simple-script-vesting";

const toClaim = [
  {
    address: config.nativeScriptAddress,
    nativeScript: {
      requireTimeAfterSlot: config.requireTimeAfterSlot,
      requireSignature: config.requireSignature,
    },
    assets: [
      { currencySymbol: "", tokenName: "" },
    ]
  }
];

async function claim() {
  const wProvider = await selectWalletProvider(config.signingKey);
  const claim = new Claim(networkName(config.network), wProvider, config.apiKey);
  const txHash = await claim.claimFunds(toClaim);
  console.log(txHash);
}

claim();
