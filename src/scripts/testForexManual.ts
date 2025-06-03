import "reflect-metadata";
import "@/config/env";
import { AppDataSource } from "@/config/data-source";
import { Container } from "typedi";
import { fetchForexPrice } from "@/core/ForexApiClient";
import { ForexPredictionService } from "@/services/ForexPredictionService";

async function run() {
  try {
    console.log("🔧 Initializing DB...");
    await AppDataSource.initialize();
    Container.set("db", AppDataSource);

    const service = Container.get(ForexPredictionService);

    const currency = "USD"; // 👈 غير لـ "GBP" لو حابب
    console.log(`🌍 Fetching latest rate for ${currency}...`);

    const data = await fetchForexPrice(currency);
    console.log("📦 API response:", data);

    await service.updateOrCreateDailyPrice(data);
    console.log("✅ Saved to database successfully.");
  } catch (err) {
    console.error("❌ Error during manual forex test:", err);
  } finally {
    await AppDataSource.destroy();
    console.log("🔌 Database connection closed.");
  }
}

run();
