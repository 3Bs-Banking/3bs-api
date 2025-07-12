import axios from "axios";

const API_URL =
  process.env.FOREX_API_URL || "https://api.fastforex.io/fetch-one";
const API_KEY = process.env.FOREX_API_KEY;

export type ForexCurrency = "USD" | "GBP";

export interface ForexPriceResponse {
  currency: ForexCurrency;
  toCurrency: "EGP";
  rate: number;
  timestamp: string;
}

export async function fetchForexPrice(
  baseCurrency: ForexCurrency
): Promise<ForexPriceResponse> {
  if (!API_KEY) {
    throw new Error("Missing FOREX_API_KEY in environment variables");
  }

  console.log(`[ForexApiClient] Fetching ${baseCurrency}/EGP exchange rate...`);

  try {
    const response = await axios.get(API_URL, {
      params: {
        from: baseCurrency,
        to: "EGP",
        api_key: API_KEY
      },
      timeout: 10000 // 10 second timeout
    });

    console.log(`[ForexApiClient] API Response status: ${response.status}`);

    const rate = response.data?.result?.["EGP"];
    const timestamp = response.data?.updated;

    if (!rate || !timestamp) {
      console.error(
        "[ForexApiClient] Invalid API response structure:",
        response.data
      );
      throw new Error("Invalid API response structure");
    }

    console.log(
      `[ForexApiClient] Successfully fetched ${baseCurrency}/EGP: ${rate} at ${timestamp}`
    );

    return {
      currency: baseCurrency,
      toCurrency: "EGP",
      rate: parseFloat(rate.toFixed(4)), // Ensure 4 decimal places
      timestamp
    };
  } catch (err: any) {
    if (err.code === "ECONNABORTED") {
      console.error(`[ForexApiClient] Request timeout for ${baseCurrency}/EGP`);
      throw new Error("Request timeout - API took too long to respond");
    } else if (err.response) {
      console.error(
        `[ForexApiClient] API Error for ${baseCurrency}/EGP:`,
        `Status: ${err.response.status}`,
        "Data:",
        err.response.data
      );
      throw new Error(
        `API Error: ${err.response.status} - ${err.response.data?.message || "Unknown error"}`
      );
    } else if (err.request) {
      console.error(
        `[ForexApiClient] Network error for ${baseCurrency}/EGP:`,
        err.message
      );
      throw new Error("Network error - Unable to reach API");
    } else {
      console.error(
        `[ForexApiClient] Unexpected error for ${baseCurrency}/EGP:`,
        err.message
      );
      throw new Error(`Failed to fetch exchange rate: ${err.message}`);
    }
  }
}
