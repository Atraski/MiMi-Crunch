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
      order_id: "TEST_" + Math.floor(Math.random() * 1000000),
      customer_details: {
        customer_id: "tester_1",
        customer_phone: "9999999999",
        customer_name: "Test User",
        customer_email: "test@example.com",
      },
      order_meta: {
        return_url: "http://localhost:5173/order-success?order_id={order_id}"
      }
    };

    console.log("Calling PGCreateOrder...");
    const response = await cashfree.PGCreateOrder("2023-08-01", request);
    console.log("Success!");
    console.log(response.data);
  } catch (error) {
    console.error("Error Status:", error.response?.status);
    console.error("Error Data:", JSON.stringify(error.response?.data, null, 2));
  }
}

test();
