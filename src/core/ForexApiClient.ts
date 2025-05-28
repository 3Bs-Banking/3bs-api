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

  try {
    const response = await axios.get(API_URL, {
      params: {
        from: baseCurrency,
        to: "EGP",
        api_key: API_KEY
      }
    });

    const rate = response.data?.result?.["EGP"];
    const timestamp = response.data?.updated;

    if (!rate || !timestamp) {
      throw new Error("Invalid API response structure");
    }

    return {
      currency: baseCurrency, // ✅ added field to match ForexPriceInput
      toCurrency: "EGP",
      rate,
      timestamp
    };
  } catch (err: any) {
    console.error(
      `[ForexApiClient] Failed to fetch ${baseCurrency}/EGP:`,
      err.message
    );
    throw new Error("Failed to fetch exchange rate");
  }
}
