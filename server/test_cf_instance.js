import { Cashfree, CFEnvironment } from "cashfree-pg";
import dotenv from "dotenv";
dotenv.config();

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX, 
  process.env.app_id, 
  process.env.secret_key
);

async function test() {
  try {
    const request = {
      order_amount: 1,
      order_currency: "INR",
      order_id: "TEST_" + Date.now(),
      customer_details: {
        customer_id: "tester_1",
        customer_phone: "9999999999",
        customer_name: "Test User",
        customer_email: "test@example.com",
      },
    };

    console.log("Creating order...");
    const response = await cashfree.PGCreateOrder("2023-08-01", request);
    console.log("Success! Response data:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Error detected!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Message:", error.message);
    }
  }
}

test();
