import { initLucid, lockUtxo, redeemUtxo } from "./util";

await initLucid();

const pass = 12344321;
console.log("Datum pass: ", pass);

document.getElementById("lock")?.addEventListener("click", () => {
  const userres = prompt("Enter amount to lock in Ada");
  // const userres = "10";
  if (userres) {
    const ada = parseInt(userres, 10);
    console.log(ada);
    lockUtxo(pass, BigInt(ada * 1000000)).then(console.log);
  }
});

document.getElementById("unlock")?.addEventListener("click", () => {
  redeemUtxo(pass).then(console.log);
});
