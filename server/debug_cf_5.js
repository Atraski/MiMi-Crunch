import * as CashfreePkg from "cashfree-pg";
console.log("Package keys:", Object.keys(CashfreePkg));
if (CashfreePkg.Cashfree) {
    console.log("Cashfree keys (nested):", Object.keys(CashfreePkg.Cashfree));
}
