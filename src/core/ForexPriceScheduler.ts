import { fetchForexPrice } from "@/core/ForexApiClient";
import { ForexPredictionService } from "@/services/ForexPredictionService";
import { isEgyptHoliday } from "@/core/HolidayService";
import { Container } from "typedi";
import cron from "node-cron";
import { DateTime } from "luxon";

/**
 * Production Forex Scheduler
 * Runs every 1 minute during Egyptian market hours (9:50 AM - 2:20 PM)
 * Skips weekends (Friday & Saturday in Egypt) and holidays
 * Only saves records when values have changed from the last saved record
 * 
 * Logic:
 * - First request of the day (9:50 AM) sets the OPEN price (remains fixed all day)
 * - Subsequent requests only update HIGH and LOW values
 * - Skips saving if open, high, low are exactly the same as last saved record
 */
export function startForexSchedule() {
  console.log("Forex Scheduler: Setting up cron job to run every 1 minute");
  
  // Run every 1 minute
  cron.schedule("* * * * *", async () => {
    const now = DateTime.now().setZone("Africa/Cairo");
    console.log(`Forex Scheduler: Checking if should run at ${now.toFormat("yyyy-MM-dd HH:mm:ss")} Cairo time`);
    
    // Check if we should run
    const shouldRun = await shouldRunForexUpdate(now);
    if (!shouldRun.run) {
      console.log(`Forex Scheduler: Skipping - ${shouldRun.reason}`);
      return;
    }
    
    console.log("Forex Scheduler: Running forex update...");
    // Run the forex update
    await runForexUpdate(now);
  });

  // Also run immediately on startup if within trading hours
  console.log("Forex Scheduler: Checking startup conditions...");
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
  try {
    const isHoliday = await isEgyptHoliday(now);
    if (isHoliday) {
      return { run: false, reason: "Egyptian Holiday" };
    }
  } catch (error) {
    console.warn("Forex Scheduler: Failed to check holiday status, proceeding anyway");
  }

  // Check if within trading hours (9:50 AM to 2:20 PM)
  const timeInMinutes = hour * 60 + minute;
  const startTime = 9 * 60 + 50;  // 9:50 AM = 590 minutes
  const endTime = 14 * 60 + 20;   // 2:20 PM = 860 minutes

  if (timeInMinutes < startTime || timeInMinutes > endTime) {
    return { run: false, reason: `Outside trading hours (current: ${now.toFormat("HH:mm")}, trading: 09:50-14:20)` };
  }

  return { run: true };
}

/**
 * Run the forex price update with proper daily open logic and change detection
 */
async function runForexUpdate(now: DateTime) {
  const service = Container.get(ForexPredictionService);
  let successCount = 0;
  let totalCount = 0;
  let skippedCount = 0;

  for (const currency of ["USD", "GBP"] as const) {
    totalCount++;
    try {
      console.log(`Forex Scheduler: Fetching ${currency}/EGP price...`);
      
      // Fetch current price from API
      const priceData = await fetchForexPrice(currency);
      console.log(`Forex Scheduler: Got ${currency}/EGP rate: ${priceData.rate}`);

      // Get the last saved record for this currency (latest overall, not just today)
      const lastSavedRecord = await service.getLatestByCurrency(currency);
      
      // Check if we have a record for today specifically
      const todaysRecord = await service.getTodaysRecord(currency);

      if (!todaysRecord) {
        // First request of the day - this will set the OPEN price
        console.log(`Forex Scheduler: First request of the day for ${currency} - setting OPEN price to ${priceData.rate}`);
        
        // Even for first request, check if values are same as last saved record
        if (lastSavedRecord && 
            lastSavedRecord.open === priceData.rate && 
            lastSavedRecord.high === priceData.rate && 
            lastSavedRecord.low === priceData.rate) {
          console.log(`Forex Scheduler: Skipping ${currency} - values unchanged from last record (open=${lastSavedRecord.open}, high=${lastSavedRecord.high}, low=${lastSavedRecord.low})`);
          skippedCount++;
          continue;
        }
        
        await service.createNewPriceRecord(priceData);
        console.log(`Forex Scheduler: Created new ${currency} record with OPEN=${priceData.rate} (this will remain fixed for the day)`);
      } else {
        // Calculate what the new values would be after update
        const currentOpen = todaysRecord.open; // This never changes
        const newHigh = Math.max(todaysRecord.high, priceData.rate);
        const newLow = Math.min(todaysRecord.low, priceData.rate);
        
        console.log(`Forex Scheduler: Comparing ${currency} values - Current: open=${currentOpen}, high=${todaysRecord.high}, low=${todaysRecord.low} | New rate: ${priceData.rate} | Would result in: open=${currentOpen}, high=${newHigh}, low=${newLow}`);
        
        // Check if the resulting values would be exactly the same as current record
        if (currentOpen === todaysRecord.open && 
            newHigh === todaysRecord.high && 
            newLow === todaysRecord.low) {
          console.log(`Forex Scheduler: Skipping ${currency} - no changes needed (open=${currentOpen}, high=${newHigh}, low=${newLow})`);
          skippedCount++;
          continue;
        }
        
        // Values would change, so update the record
        console.log(`Forex Scheduler: Updating existing ${currency} record (OPEN=${currentOpen} remains fixed)`);
        const updateResult = await service.updateExistingPriceRecord(todaysRecord, priceData);
        console.log(`Forex Scheduler: ${currency} update result: ${updateResult}`);
      }

      // Calculate and save predicted close (if not already calculated)
      console.log(`Forex Scheduler: Calculating prediction for ${currency}...`);
      await service.calculateAndSavePredictedClose(currency);
      console.log(`Forex Scheduler: Prediction calculated for ${currency}`);

      successCount++;
    } catch (err) {
      const error = err as Error;
      console.error(`Forex Scheduler: Failed to update ${currency}:`, error.message);
    }
  }

  console.log(`Forex Scheduler: Update completed - ${successCount}/${totalCount} currencies updated, ${skippedCount} skipped (no changes)`);
}

/**
 * Check and run on startup if within trading hours
 */
async function checkAndRunOnStartup() {
  const now = DateTime.now().setZone("Africa/Cairo");
  console.log(`Forex Scheduler: Startup check at ${now.toFormat("yyyy-MM-dd HH:mm:ss")} Cairo time`);
  
  const shouldRun = await shouldRunForexUpdate(now);

  if (shouldRun.run) {
    console.log("Forex Scheduler: Running initial update on startup...");
    await runForexUpdate(now);
  } else {
    console.log(`Forex Scheduler: Skipping startup update - ${shouldRun.reason}`);
  }
}