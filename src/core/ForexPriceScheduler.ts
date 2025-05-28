import { fetchForexPrice } from "@/core/ForexApiClient";
import { ForexPredictionService } from "@/services/ForexPredictionService";
import { isEgyptHoliday } from "@/core/HolidayService"; //
import { Container } from "typedi";
import cron from "node-cron";
import { DateTime } from "luxon";

const service = Container.get(ForexPredictionService);

export function startForexSchedule() {
  console.log("Forex scheduler started");

  cron.schedule("*/10 * * * *", async () => {
    const now = DateTime.now().setZone("Africa/Cairo");
    const weekday = now.weekday;
    const isWeekend = weekday === 5 || weekday === 6;
    const isHoliday = await isEgyptHoliday(now);

    const hour = now.hour;
    const minute = now.minute;
    const isActiveTime =
      (hour === 10 && minute >= 0) ||
      (hour > 10 && hour < 14) ||
      (hour === 14 && minute <= 20);

    if (!isActiveTime || isWeekend || isHoliday) {
      console.log(
        `⏸ Skipping: ${isWeekend ? "Weekend" : isHoliday ? "Holiday" : "Outside hours"} at ${now.toISO()}`
      );
      return;
    }

    for (const currency of ["USD", "GBP"] as const) {
      try {
        const priceData = await fetchForexPrice(currency);
        await service.updateOrCreateDailyPrice(priceData);
        console.log(`${currency}: ${priceData.rate} at ${priceData.timestamp}`);
      } catch (err) {
        console.error(`${currency} fetch failed:`, err);
      }
    }
  });
}
