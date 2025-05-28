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
  //         console.error("Python Error:", err.toString());
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
  private async callPythonModel(data: {
    open: number;
    high: number;
    low: number;
    currency: string;
  }): Promise<number> {
    const avg = (data.open + data.high + data.low) / 3;
    console.log(`[Mock AI] Predicted close for ${data.currency}: ${avg}`);
    return parseFloat(avg.toFixed(4));
  }
}
