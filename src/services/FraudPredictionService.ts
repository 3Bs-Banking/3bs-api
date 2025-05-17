import BaseService from "@/core/BaseService";
import { FraudPrediction } from "@/models/FraudPrediction";
import { Service } from "typedi";
import { DeepPartial } from "typeorm";
import { spawn } from "child_process";

@Service()
export class FraudPredictionService extends BaseService<FraudPrediction> {
  constructor() {
    super(FraudPrediction);
  }

  async create(data: DeepPartial<FraudPrediction>): Promise<FraudPrediction> {
    if (!data.transaction) {
      throw new Error("Missing transaction data.");
    }

    const prediction = await this.callPythonModel(data.transaction);

    const record = this.repository.create({
      ...data,
      prediction
    });

    return await this.repository.save(record);
  }

  private async callPythonModel(
    transaction: Record<string, any>
  ): Promise<"Fraud" | "Not Fraud"> {
    return new Promise((resolve, reject) => {
      try {
        const py = spawn("python", ["python/fraudModel.py"]);
        let result = "";

        py.stdout.on("data", (data) => {
          result += data.toString();
        });

        py.stderr.on("data", (err) => {
          console.error("Python Error:", err.toString());
          reject(err.toString());
        });

        py.on("close", () => {
          try {
            const parsed = JSON.parse(result);
            resolve(parsed.prediction);
          } catch (e) {
            reject("Failed to parse prediction");
          }
        });

        py.stdin.write(JSON.stringify(transaction));
        py.stdin.end();
      } catch (error) {
        console.error("Failed to spawn Python script:", error);
        reject("Failed to spawn Python script");
      }
    });
  }
}
