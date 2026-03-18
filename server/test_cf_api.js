import { Cashfree, CFEnvironment } from "cashfree-pg";
import dotenv from "dotenv";
dotenv.config();

Cashfree.XClientId = process.env.app_id;
Cashfree.XClientSecret = process.env.secret_key;
Cashfree.XEnvironment = CFEnvironment.SANDBOX;

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
      order_meta: {
        return_url: "http://localhost:5173/order-success?order_id={order_id}",
      },
    };

    console.log("Creating order with request:", JSON.stringify(request, null, 2));
    const response = await Cashfree.PGCreateOrder("2023-08-01", request);
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
