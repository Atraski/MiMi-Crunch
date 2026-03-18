import { Cashfree } from "cashfree-pg";
console.log("Cashfree keys:", Object.keys(Cashfree));
for (let key of Object.keys(Cashfree)) {
    console.log(`Type of Cashfree.${key}:`, typeof Cashfree[key]);
}
