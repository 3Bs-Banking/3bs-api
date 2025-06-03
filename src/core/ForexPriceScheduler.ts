import { fetchForexPrice } from "@/core/ForexApiClient";
import { ForexPredictionService } from "@/services/ForexPredictionService";
import { isEgyptHoliday } from "@/core/HolidayService";
import { Container } from "typedi";
import cron from "node-cron";
import { DateTime } from "luxon";

/**
 * Production Forex Scheduler
 * Runs every 10 minutes during Egyptian market hours (9:50 AM - 2:20 PM)
 * Skips weekends (Friday & Saturday in Egypt) and holidays
 */
export function startForexSchedule() {
  // Run every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    const now = DateTime.now().setZone("Africa/Cairo");
    // Check if we should run
    const shouldRun = await shouldRunForexUpdate(now);
    if (!shouldRun.run) {
      return;
    }
    // Run the forex update
    await runForexUpdate(now);
  });

  // Also run immediately on startup if within trading hours
  checkAndRunOnStartup();
}

/**
 * Check if we should run the forex update based on time, day, and holidays
 */
async function shouldRunForexUpdate(now: DateTime): Promise<{ run: boolean; reason?: string }> {
  const hour = now.hour;
  const minute = now.minute;
  const weekday = now.weekday;

  // Check if it's weekend (Friday = 5, Saturday = 6 in Luxon)
  if (weekday === 5 || weekday === 6) {
    return { run: false, reason: `Weekend (${weekday === 5 ? 'Friday' : 'Saturday'})` };
  }

  // Check if it's a holiday
  const isHoliday = await isEgyptHoliday(now);
  if (isHoliday) {
    return { run: false, reason: "Egyptian Holiday" };
  }

  // Check if within trading hours (9:50 AM to 2:20 PM)
  const timeInMinutes = hour * 60 + minute;
  const startTime = 9 * 60 + 50;  // 9:50 AM = 590 minutes
  const endTime = 14 * 60 + 20;   // 2:20 PM = 860 minutes

  if (timeInMinutes < startTime || timeInMinutes > endTime) {
    return { run: false, reason: `Outside trading hours (current: ${now.toFormat("HH:mm")})` };
  }

  return { run: true };
}

/**
 * Run the forex price update
 */
async function runForexUpdate(now: DateTime) {
  const service = Container.get(ForexPredictionService);

  for (const currency of ["USD", "GBP"] as const) {
    try {
      // Fetch current price from API
      const priceData = await fetchForexPrice(currency);

      // Get latest entry for this currency
      const latest = await service.getLatestByCurrency(currency);

      if (!latest) {
        // No previous record → create new
        await service.createNewPriceRecord(priceData);
      } else {
        const recordTime = DateTime.fromJSDate(latest.createdAt);
        const diffInHours = now.diff(recordTime, "hours").hours;

        if (diffInHours > 1) {
          // If older than 1 hour → create new with same rate
          await service.createNewPriceRecord(priceData);
        } else {
          // Else update existing record's high/low
          await service.updateExistingPriceRecord(latest, priceData);
        }
      }

      // Calculate and save predicted close
      await service.calculateAndSavePredictedClose(currency);

    } catch (err) {
      // Error silently ignored
    }
  }
}

/**
 * Check and run on startup if within trading hours
 */
async function checkAndRunOnStartup() {
  const now = DateTime.now().setZone("Africa/Cairo");
  const shouldRun = await shouldRunForexUpdate(now);

  if (shouldRun.run) {
    await runForexUpdate(now);
  }
}
