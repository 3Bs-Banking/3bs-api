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
    const existing = await this.repository.findOne({
      where: {
        currency,
        createdAt: Between(startOfDay, endOfDay)
      },
      order: { createdAt: "DESC" }
    });

    if (!existing) {
      const newRecord = this.repository.create({
        currency,
        open: rate,
        high: rate,
        low: rate
      });
      await this.repository.save(newRecord);
      return;
    }

    let updated = false;

    if (rate > existing.high) {
      existing.high = rate;
      updated = true;
    }

    if (rate < existing.low) {
      existing.low = rate;
      updated = true;
    }

    if (updated) {
      await this.repository.save(existing);
    }
  }

  async predictClosingPrice(currency: "USD" | "GBP"): Promise<void> {
    const today = DateTime.now().setZone("Africa/Cairo");
    const start = today.startOf("day").toJSDate();
    const end = today.endOf("day").toJSDate();

    const record = await this.repository.findOne({
      where: {
        currency,
        createdAt: Between(start, end)
      },
      order: { createdAt: "DESC" }
    });

    if (!record) return;

    const predictedClose = await this.callPythonModel({
      open: record.open,
      high: record.high,
      low: record.low,
      currency
    });

    record.predictedClose = predictedClose;
    await this.repository.save(record);
  }

  /**
   * Get the latest forex prediction for a specific currency
   * @param currency - Currency code (USD or GBP)
   * @returns The latest ForexPrediction or null if not found
   */
  async getLatestByCurrency(currency: "USD" | "GBP"): Promise<ForexPrediction | null> {
    return await this.repository.findOne({
      where: { currency },
      order: { createdAt: "DESC" }
    });
  }

  /**
   * Create a new price record
   */
  async createNewPriceRecord(input: ForexPriceInput): Promise<ForexPrediction> {
    const { currency, rate } = input;

    const newRecord = this.repository.create({
      currency,
      open: rate,
      high: rate,
      low: rate
    });

    return await this.repository.save(newRecord);
  }

  /**
   * Update existing price record with new rate
   */
  async updateExistingPriceRecord(existing: ForexPrediction, input: ForexPriceInput): Promise<string> {
    const { rate } = input;
    const updates: string[] = [];

    // Update high if new rate is higher
    if (rate > existing.high) {
      existing.high = rate;
      updates.push(`High: ${rate}`);
    }

    // Update low if new rate is lower
    if (rate < existing.low) {
      existing.low = rate;
      updates.push(`Low: ${rate}`);
    }

    if (updates.length > 0) {
      await this.repository.save(existing);
      return updates.join(', ');
    }

    return "No changes needed";
  }

  /**
   * Calculate predicted close using ML model and save
   */
  async calculateAndSavePredictedClose(currency: "USD" | "GBP"): Promise<void> {
    const latest = await this.getLatestByCurrency(currency);

    if (!latest) {
      // Skipping if no data available for prediction
      return;
    }

    // Only calculate if we don't already have a predicted close
    if (latest.predictedClose !== null) {
      return;
    }

    try {
      const predictedClose = await this.callPythonModel({
        open: latest.open,
        high: latest.high,
        low: latest.low,
        currency
      });

      latest.predictedClose = predictedClose;
      await this.repository.save(latest);
    } catch (error) {
      // Silently handle prediction error
    }
  }

  // private async callPythonModel(data: {
  //   open: number;
  //   high: number;
  //   low: number;
  //   currency: string;
  // }): Promise<number> {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       const py = spawn("python", ["python/forexModel.py"]);
  //       let result = "";

  //       py.stdout.on("data", (chunk) => {
  //         result += chunk.toString();
  //       });

  //       py.stderr.on("data", (err) => {
  //         reject("Python script error.");
  //       });

  //       py.on("close", () => {
  //         try {
  //           const parsed = JSON.parse(result);
  //           resolve(parsed.predictedClose);
  //         } catch {
  //           reject("Failed to parse Python response.");
  //         }
  //       });

  //       py.stdin.write(JSON.stringify(data));
  //       py.stdin.end();
  //     } catch {
  //       reject("Failed to run Python model.");
  //     }
  //   });
  // }

  /**
   * Call Python model for prediction
   * TODO: Uncomment the code above and remove this mock when Python model is ready
   */
  private async callPythonModel(data: {
    open: number;
    high: number;
    low: number;
    currency: string;
  }): Promise<number> {
    // TEMPORARY: Mock implementation
    // Replace with actual Python model call above when ready
    const avg = (data.open + data.high + data.low) / 3;
    const prediction = avg * 1.002; // Mock 0.2% increase prediction
    return parseFloat(prediction.toFixed(4));
  }
}
