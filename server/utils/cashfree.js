import { Cashfree, CFEnvironment } from "cashfree-pg";

// Production: set CASHFREE_PROD=true or NODE_ENV=production, and use non-localhost URL.
// Localhost = always SANDBOX so real money is never deducted during local testing.
const isProdEnv =
  process.env.CASHFREE_PROD === "true" ||
  process.env.CASHFREE_PROD === "1" ||
  process.env.NODE_ENV === "production";

const apiOrSite = (process.env.API_URL || process.env.SITE_URL || "").toLowerCase();
const isLocalhost =
  /localhost|127\.0\.0\.1/.test(apiOrSite) ||
  (apiOrSite === "" && process.env.NODE_ENV !== "production");

const prodAppId =
  process.env.CASHFREE_APP_ID_PROD ||
  process.env.app_id_prod ||
  (isProdEnv ? process.env.CASHFREE_APP_ID || process.env.app_id : null);
const prodSecret =
  process.env.CASHFREE_SECRET_KEY_PROD ||
  process.env.secret_key_prod ||
  (isProdEnv ? process.env.CASHFREE_SECRET_KEY || process.env.secret_key : null);

const testAppId = process.env.CASHFREE_APP_ID || process.env.app_id;
const testSecret = process.env.CASHFREE_SECRET_KEY || process.env.secret_key;

const useProduction =
  isProdEnv &&
  Boolean(prodAppId && prodSecret) &&
  !isLocalhost;

const APP_ID = useProduction ? prodAppId : testAppId;
const SECRET_KEY = useProduction ? prodSecret : testSecret;
const ENV = useProduction ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

if (!APP_ID || !SECRET_KEY) {
  console.warn(
    "[Cashfree] Missing credentials. Set CASHFREE_APP_ID + CASHFREE_SECRET_KEY (test) or CASHFREE_APP_ID_PROD + CASHFREE_SECRET_KEY_PROD with CASHFREE_PROD=true (production)."
  );
} else {
  console.log("[Cashfree] Using", useProduction ? "PRODUCTION" : "SANDBOX");
}

const cashfree =
  APP_ID && SECRET_KEY
    ? new Cashfree(ENV, APP_ID, SECRET_KEY)
    : null;

/**
 * Create a Cashfree PG order and get payment_session_id for hosted checkout.
 */
export const createPaymentSession = async ({
  orderId,
  amount,
  customerDetails,
}) => {
  if (!cashfree) {
    const err = new Error("Payment gateway is not configured. Please contact support.");
    err.code = "CASHFREE_NOT_CONFIGURED";
    throw err;
  }

  const baseUrl = process.env.SITE_URL || "http://localhost:5173";
  const apiBase = process.env.API_URL || "http://localhost:5000";

  const phone = String(customerDetails.phone || "9999999999")
    .replace(/\D/g, "")
    .slice(-10) || "9999999999";

  const request = {
    order_amount: Number(amount),
    order_currency: "INR",
    order_id: String(orderId),
    customer_details: {
      customer_id: String(customerDetails.customerId || `GUEST_${Date.now()}`),
      customer_phone: phone,
      customer_name: String(customerDetails.name || "Customer").slice(0, 100),
      customer_email: String(
        customerDetails.email || "noreply@mimicrunch.com"
      ).slice(0, 100),
    },
    order_meta: {
      return_url: `${baseUrl}/order-success?order_id={order_id}`,
      notify_url: `${apiBase}/api/orders/webhook/cashfree`,
    },
  };

  try {
    let response;
    if (typeof cashfree.PGCreateOrder !== "function") {
      throw new Error("Payment gateway error: invalid setup.");
    }
    try {
      response = await cashfree.PGCreateOrder(request);
    } catch (e) {
      if (
        e?.message?.includes("is not a function") ||
        e?.code === "ERR_INVALID_ARG_TYPE"
      ) {
        response = await cashfree.PGCreateOrder("2023-08-01", request);
      } else {
        throw e;
      }
    }

    const data = response?.data || response;
    const paymentSessionId =
      data.payment_session_id || data.payment_sessions_id;

    if (!paymentSessionId) {
      console.error("[Cashfree] Create order: no payment_session_id", data);
      throw new Error("Invalid response from payment gateway.");
    }

    return {
      payment_session_id: paymentSessionId,
      order_id: data.order_id || orderId,
    };
  } catch (error) {
    const apiMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message;
    console.error("[Cashfree] Session creation failed:", apiMsg, error?.response?.data);
    const err = new Error(
      apiMsg && typeof apiMsg === "string"
        ? apiMsg
        : "Payment gateway error. Please try again."
    );
    err.original = error;
    err.statusCode = error?.response?.status;
    throw err;
  }
};

/**
 * Fetch payment status for a Cashfree order.
 */
export const verifyPayment = async (cfOrderId) => {
  if (!cashfree) {
    const err = new Error("Payment gateway is not configured.");
    err.code = "CASHFREE_NOT_CONFIGURED";
    throw err;
  }

  const orderIdStr = String(cfOrderId);

  try {
    let response;
    try {
      response = await cashfree.PGOrderFetchPayments(orderIdStr);
    } catch (e) {
      if (
        e?.message?.includes("is not a function") ||
        e?.code === "ERR_INVALID_ARG_TYPE"
      ) {
        response = await cashfree.PGOrderFetchPayments(
          "2023-08-01",
          orderIdStr
        );
      } else {
        throw e;
      }
    }

    const data = response?.data || response;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.payments)) return data.payments;
    return [];
  } catch (error) {
    const apiMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message;
    console.error("[Cashfree] Verify payment failed:", apiMsg);
    const err = new Error(
      apiMsg && typeof apiMsg === "string"
        ? apiMsg
        : "Could not verify payment."
    );
    err.original = error;
    throw err;
  }
};
