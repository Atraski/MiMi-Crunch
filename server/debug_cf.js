import { Cashfree } from "cashfree-pg";
console.log("Cashfree keys:", Object.keys(Cashfree));
if (Cashfree.Environment) {
    console.log("Environment keys:", Object.keys(Cashfree.Environment));
} else {
    console.log("Environment is undefined on Cashfree object");
}
