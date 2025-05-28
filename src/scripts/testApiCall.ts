import "reflect-metadata";
import "../config/env";
import { fetchForexPrice } from "../core/ForexApiClient";

async function test() {
  try {
    const usd = await fetchForexPrice("USD");
    console.log("USD → EGP:", usd);

    const gbp = await fetchForexPrice("GBP");
    console.log("GBP → EGP:", gbp);
  } catch (err) {
    console.error("API call failed:", err);
  }
}

test();
