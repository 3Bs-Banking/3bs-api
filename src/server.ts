import "@/config/env";
import "reflect-metadata";
import { Container } from "typedi";
import express from "express";
import { AppDataSource as db } from "@/config/data-source";
import apiConfig from "@/config/api";
import apiRoute from "@/routes/ApiRoute";
import { startForexSchedule } from "@/core/ForexPriceScheduler";

async function start() {
  console.log("Initializing DB");
  await db.initialize();
  console.log(`Connected to DB: ${db.driver.database}`);
  Container.set("db", db);

  const app = express();

  app.use(apiConfig());

  app.use("/api", apiRoute);

  // Start the forex scheduler
  console.log("Starting Forex Price Scheduler...");
  startForexSchedule();
  console.log("Forex Price Scheduler started successfully");

  app.listen(process.env.PORT || 5000, () => {
    console.log(
      `Server running on http://${process.env.HOST}:${process.env.PORT}`
    );
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});