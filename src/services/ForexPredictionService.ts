import { Service } from "typedi";
import BaseService from "@/core/BaseService";
import { ForexPrediction } from "@/models/ForexPrediction";
import { Between } from "typeorm";
import { DateTime } from "luxon";

interface ForexPriceInput {
  currency: "USD" | "GBP";
  rate: number;
  timestamp: string;
}

@Service()
export class ForexPredictionService extends BaseService<ForexPrediction> {
  constructor() {
    super(ForexPrediction);
  }

  async updateOrCreateDailyPrice(input: ForexPriceInput): Promise<void> {
    const { currency, rate, timestamp } = input;

    const cairoNow = DateTime.fromISO(timestamp, { zone: "Africa/Cairo" });
    const startOfDay = cairoNow.startOf("day").toJSDate();
    const endOfDay = cairoNow.endOf("day").toJSDate();

    console.log(
      `[ForexPredictionService] Processing ${currency} rate: ${rate} at ${cairoNow.toFormat("yyyy-MM-dd HH:mm:ss")} Cairo time`
    );

    // Look for existing record for today
    const existing = await this.repository.findOne({
      where: {
        currency,
        createdAt: Between(startOfDay, endOfDay)
      },
      order: { createdAt: "DESC" }
    });

    if (!existing) {
      // First request of the day - create new record with open, high, low all set to current rate
      console.log(
        `[ForexPredictionService] First request of the day for ${currency} - setting open price to ${rate}`
      );
      const newRecord = this.repository.create({
        currency,
        open: rate, // OPEN is set only once at first request
        high: rate,
        low: rate
      });
      await this.repository.save(newRecord);
      console.log(
        `[ForexPredictionService] Created new ${currency} record - open: ${rate}, high: ${rate}, low: ${rate}`
      );
      return;
    }

    // Existing record found - update only high and low, NEVER change open
    console.log(
      `[ForexPredictionService] Found existing ${currency} record - open: ${existing.open} (fixed), current high: ${existing.high}, current low: ${existing.low}`
    );

    let updated = false;
    const updates: string[] = [];

    // Update high if new rate is higher
    if (rate > existing.high) {
      console.log(
        `[ForexPredictionService] New high for ${currency}: ${rate} (previous: ${existing.high})`
      );
      existing.high = rate;
      updated = true;
      updates.push(`high: ${existing.high} → ${rate}`);
    }

    // Update low if new rate is lower
    if (rate < existing.low) {
      console.log(
        `[ForexPredictionService] New low for ${currency}: ${rate} (previous: ${existing.low})`
      );
      existing.low = rate;
      updated = true;
      updates.push(`low: ${existing.low} → ${rate}`);
    }

    if (updated) {
      await this.repository.save(existing);
      console.log(
        `[ForexPredictionService] Updated ${currency} record: ${updates.join(", ")} (open remains: ${existing.open})`
      );
    } else {
      console.log(
        `[ForexPredictionService] No updates needed for ${currency} - rate ${rate} is within current range (high: ${existing.high}, low: ${existing.low}, open unchanged: ${existing.open})`
      );
    }
  }

  async predictClosingPrice(currency: "USD" | "GBP"): Promise<void> {
    const today = DateTime.now().setZone("Africa/Cairo");
    const start = today.startOf("day").toJSDate();
    const end = today.endOf("day").toJSDate();

    console.log(
      `[ForexPredictionService] Predicting closing price for ${currency} on ${today.toISODate()}`
    );

    const record = await this.repository.findOne({
      where: {
        currency,
        createdAt: Between(start, end)
      },
      order: { createdAt: "DESC" }
    });

    if (!record) {
      console.log(
        `[ForexPredictionService] No record found for ${currency} today, skipping prediction`
      );
      return;
    }

    if (record.predictedClose !== null) {
      console.log(
        `[ForexPredictionService] ${currency} already has predicted close: ${record.predictedClose}`
      );
      return;
    }

    try {
      const predictedClose = await this.callPythonModel({
        open: record.open,
        high: record.high,
        low: record.low,
        currency
      });

      record.predictedClose = predictedClose;
      await this.repository.save(record);
      console.log(
        `[ForexPredictionService] Saved predicted close for ${currency}: ${predictedClose}`
      );
    } catch (error) {
      const err = error as Error;
      console.error(
        `[ForexPredictionService] Failed to predict closing price for ${currency}:`,
        err.message
      );
    }
  }

  /**
   * Get the latest forex prediction for a specific currency
   * Returns the most recent record, regardless of date
   */
  async getLatestByCurrency(
    currency: "USD" | "GBP"
  ): Promise<ForexPrediction | null> {
    console.log(
      `[ForexPredictionService] Getting latest record for ${currency}`
    );

    const latest = await this.repository.findOne({
      where: { currency },
      order: { createdAt: "DESC" }
    });

    if (latest) {
      const recordTime = DateTime.fromJSDate(latest.createdAt);
      console.log(
        `[ForexPredictionService] Found latest ${currency} record from ${recordTime.toFormat("yyyy-MM-dd HH:mm:ss")} - open: ${latest.open}, high: ${latest.high}, low: ${latest.low}`
      );
    } else {
      console.log(`[ForexPredictionService] No records found for ${currency}`);
    }

    return latest;
  }

  /**
   * Get today's record for a specific currency
   * Returns today's record or null if not found
   */
  async getTodaysRecord(
    currency: "USD" | "GBP"
  ): Promise<ForexPrediction | null> {
    const today = DateTime.now().setZone("Africa/Cairo");
    const startOfDay = today.startOf("day").toJSDate();
    const endOfDay = today.endOf("day").toJSDate();

    console.log(
      `[ForexPredictionService] Getting today's record for ${currency} (${today.toISODate()})`
    );

    const todaysRecord = await this.repository.findOne({
      where: {
        currency,
        createdAt: Between(startOfDay, endOfDay)
      },
      order: { createdAt: "DESC" }
    });

    if (todaysRecord) {
      console.log(
        `[ForexPredictionService] Found today's ${currency} record - open: ${todaysRecord.open}, high: ${todaysRecord.high}, low: ${todaysRecord.low}`
      );
    } else {
      console.log(
        `[ForexPredictionService] No record found for ${currency} today`
      );
    }

    return todaysRecord;
  }

  /**
   * Check if values would change compared to current record
   * Used to determine if we should save a new record or skip
   */
  async wouldValuesChange(
    currency: "USD" | "GBP",
    newRate: number
  ): Promise<{
    wouldChange: boolean;
    reason: string;
    currentValues?: { open: number; high: number; low: number };
    newValues?: { open: number; high: number; low: number };
  }> {
    const todaysRecord = await this.getTodaysRecord(currency);

    if (!todaysRecord) {
      // No record today, so this would be first record - check against latest overall
      const latestRecord = await this.getLatestByCurrency(currency);

      if (!latestRecord) {
        return {
          wouldChange: true,
          reason: "No existing records - first record ever",
          newValues: { open: newRate, high: newRate, low: newRate }
        };
      }

      // Compare against latest record
      if (
        latestRecord.open === newRate &&
        latestRecord.high === newRate &&
        latestRecord.low === newRate
      ) {
        return {
          wouldChange: false,
          reason: "Values identical to last saved record",
          currentValues: {
            open: latestRecord.open,
            high: latestRecord.high,
            low: latestRecord.low
          },
          newValues: { open: newRate, high: newRate, low: newRate }
        };
      }

      return {
        wouldChange: true,
        reason: "Values differ from last saved record - first of day",
        currentValues: {
          open: latestRecord.open,
          high: latestRecord.high,
          low: latestRecord.low
        },
        newValues: { open: newRate, high: newRate, low: newRate }
      };
    }

    // Today's record exists - calculate what new values would be
    const currentOpen = todaysRecord.open; // Never changes
    const newHigh = Math.max(todaysRecord.high, newRate);
    const newLow = Math.min(todaysRecord.low, newRate);

    // Check if anything would actually change
    if (
      currentOpen === todaysRecord.open &&
      newHigh === todaysRecord.high &&
      newLow === todaysRecord.low
    ) {
      return {
        wouldChange: false,
        reason: "No changes to open/high/low values",
        currentValues: {
          open: todaysRecord.open,
          high: todaysRecord.high,
          low: todaysRecord.low
        },
        newValues: { open: currentOpen, high: newHigh, low: newLow }
      };
    }

    return {
      wouldChange: true,
      reason: "Values would change",
      currentValues: {
        open: todaysRecord.open,
        high: todaysRecord.high,
        low: todaysRecord.low
      },
      newValues: { open: currentOpen, high: newHigh, low: newLow }
    };
  }

  /**
   * Create a new price record (used for first request of the day)
   */
  async createNewPriceRecord(input: ForexPriceInput): Promise<ForexPrediction> {
    const { currency, rate } = input;

    console.log(
      `[ForexPredictionService] Creating first record of the day for ${currency} with opening rate ${rate}`
    );

    const newRecord = this.repository.create({
      currency,
      open: rate, // This sets the opening price for the day
      high: rate, // Initially same as open
      low: rate // Initially same as open
    });

    const saved = await this.repository.save(newRecord);
    console.log(
      `[ForexPredictionService] Successfully created new ${currency} record with ID: ${saved.id} - open: ${rate} (this will remain fixed for the day)`
    );

    return saved;
  }

  /**
   * Update existing price record with new rate (only updates high/low, never open)
   * Returns information about what was updated
   */
  async updateExistingPriceRecord(
    existing: ForexPrediction,
    input: ForexPriceInput
  ): Promise<string> {
    const { rate, currency } = input;
    const updates: string[] = [];

    console.log(
      `[ForexPredictionService] Updating existing ${currency} record - open: ${existing.open} (FIXED), current high: ${existing.high}, current low: ${existing.low}, new rate: ${rate}`
    );

    // IMPORTANT: Never update the open value - it's set once at the beginning of the day
    const originalOpen = existing.open;

    if (rate > existing.high) {
      const oldHigh = existing.high;
      existing.high = rate;
      updates.push(`High: ${oldHigh} → ${rate}`);
      console.log(
        `[ForexPredictionService] Updated high for ${currency}: ${oldHigh} → ${rate}`
      );
    }

    if (rate < existing.low) {
      const oldLow = existing.low;
      existing.low = rate;
      updates.push(`Low: ${oldLow} → ${rate}`);
      console.log(
        `[ForexPredictionService] Updated low for ${currency}: ${oldLow} → ${rate}`
      );
    }

    if (updates.length > 0) {
      await this.repository.save(existing);
      const result = updates.join(", ");
      console.log(
        `[ForexPredictionService] Successfully updated ${currency}: ${result} (open remains unchanged: ${originalOpen})`
      );
      return result;
    }

    console.log(
      `[ForexPredictionService] No changes needed for ${currency} - rate ${rate} is within range (open: ${originalOpen}, high: ${existing.high}, low: ${existing.low})`
    );
    return "No changes needed";
  }

  /**
   * Calculate predicted close using ML model and save
   */
  async calculateAndSavePredictedClose(currency: "USD" | "GBP"): Promise<void> {
    console.log(
      `[ForexPredictionService] Calculating predicted close for ${currency}...`
    );

    // Get today's record specifically (not just latest)
    const todaysRecord = await this.getTodaysRecord(currency);

    if (!todaysRecord) {
      console.log(
        `[ForexPredictionService] No data available for ${currency} prediction today`
      );
      return;
    }

    if (todaysRecord.predictedClose !== null) {
      console.log(
        `[ForexPredictionService] ${currency} already has predicted close: ${todaysRecord.predictedClose}, skipping`
      );
      return;
    }

    try {
      console.log(
        `[ForexPredictionService] Calling prediction model for ${currency} - open: ${todaysRecord.open}, high: ${todaysRecord.high}, low: ${todaysRecord.low}`
      );

      const predictedClose = await this.callPythonModel({
        open: todaysRecord.open,
        high: todaysRecord.high,
        low: todaysRecord.low,
        currency
      });

      todaysRecord.predictedClose = predictedClose;
      await this.repository.save(todaysRecord);
      console.log(
        `[ForexPredictionService] Successfully saved predicted close for ${currency}: ${predictedClose}`
      );
    } catch (error) {
      const err = error as Error;
      console.error(
        `[ForexPredictionService] Failed to calculate predicted close for ${currency}:`,
        err.message
      );
    }
  }

  /**
   * Call Python model for prediction (mock version)
   * TODO: Replace with actual Python model integration
   */
  private async callPythonModel(data: {
    open: number;
    high: number;
    low: number;
    currency: string;
  }): Promise<number> {
    console.log(
      `[ForexPredictionService] Running mock prediction model for ${data.currency}`
    );

    // TEMPORARY: Mock implementation
    // Replace with actual Python model call when ready
    const avg = (data.open + data.high + data.low) / 3;
    const prediction = avg * 1.002; // Mock 0.2% increase prediction
    const result = parseFloat(prediction.toFixed(4));

    console.log(
      `[ForexPredictionService] Mock prediction result for ${data.currency}: ${result} (based on open: ${data.open}, high: ${data.high}, low: ${data.low})`
    );
    return result;
  }
}
