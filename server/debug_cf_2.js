import * as CF_MODULE from "cashfree-pg";
console.log("Module keys:", Object.keys(CF_MODULE));
if (CF_MODULE.Cashfree) {
    console.log("Cashfree in module keys:", Object.keys(CF_MODULE.Cashfree));
    console.log("Cashfree.Environment:", CF_MODULE.Cashfree.Environment);
}
if (CF_MODULE.default) {
    console.log("Default export keys:", Object.keys(CF_MODULE.default));
}
