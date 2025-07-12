import "@/config/env";
import "reflect-metadata";
import { Container } from "typedi";
import express from "express";
import cors from "cors";
import { AppDataSource as db } from "@/config/data-source";
import apiConfig from "@/config/api";
// import apiRoute from "@/routes/ApiRoute";
import { startForexSchedule } from "@/core/ForexPriceScheduler";

async function start() {
  console.log("Initializing DB");
  await db.initialize();
  console.log(`Connected to DB: ${db.driver.database}`);
  Container.set("db", db);
  const apiRoute = (await import("@/routes/ApiRoute")).default;

  const app = express();

  // CORS Configuration - MUST be before other middleware
  app.use(
    cors({
      origin: "http://localhost:3000", // Frontend URL
      credentials: true, // Allow cookies/sessions
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      exposedHeaders: ["Set-Cookie"]
    })
  );

  // Handle preflight OPTIONS requests
  app.options(
    "*",
    cors({
      origin: "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
    })
  );

  // Apply your existing API configuration
  app.use(apiConfig());

  // Apply API routes
  app.use("/api", apiRoute);

  // Start the forex scheduler
  console.log("Starting Forex Price Scheduler...");
  startForexSchedule();
  console.log("Forex Price Scheduler started successfully");

  const PORT = process.env.PORT || 5000;
  const HOST = process.env.HOST || "localhost";

  app.listen(PORT, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log("CORS enabled for: http://localhost:3000");
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
