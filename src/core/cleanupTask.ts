// // src/schedulers/temporaryAccessCleanup.ts

// import cron from "node-cron";
// import { AppDataSource as db } from "@/config/data-source";
// import { TemporaryAccessService } from "@/services/TemporaryAccessService";
// import Container from "typedi";

// export function startTemporaryAccessCleanupScheduler() {
//   // Run every 10 minutes
//   cron.schedule("*/10 * * * *", async () => {
//     try {
//       const service = Container.get(TemporaryAccessService);
//       const count = await service.restoreRoleAndDeleteExpired(db);
//       if (count > 0) {
//         console.log(`[TemporaryAccess] Restored roles and deleted ${count} expired temporary accesses.`);
//       }
//     } catch (err) {
//       console.error("[TemporaryAccess] Cleanup scheduler error:", err);
//     }
//   });

//   console.log("[TemporaryAccess] Cleanup scheduler started (every 10 minutes)");
// }