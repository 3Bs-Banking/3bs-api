import BaseService from "@/core/BaseService";
import { FraudPrediction } from "@/models/FraudPrediction";
import { Bank } from "@/models/Bank";
import { Service } from "typedi";
import { DeepPartial } from "typeorm";
import { spawn } from "child_process";

@Service()
export class FraudPredictionService extends BaseService<FraudPrediction> {
  constructor() {
    super(FraudPrediction);
  }

  async create(
    data: DeepPartial<FraudPrediction> & { bankId: string }
  ): Promise<FraudPrediction> {
    if (!data.transaction || !data.bankId) {
      throw new Error("Missing transaction or bankId.");
    }

    const prediction = await this.callPythonModel(data.transaction);

    const record = this.repository.create({
      transaction: data.transaction,
      prediction,
      bank: { id: data.bankId } as Bank
    });

    return await this.repository.save(record);
  }

  private async callPythonModel(
    transaction: Record<string, any>
  ): Promise<"Fraud" | "Not Fraud"> {
    // Simulate Python model behavior with simple rule
    return transaction.amt > 7000 ? "Fraud" : "Not Fraud";
  }

  // private async callPythonModel(
  //   transaction: Record<string, any>
  // ): Promise<"Fraud" | "Not Fraud"> {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       const py = spawn("python", ["python/fraudModel.py"]);
  //       let result = "";

  //       py.stdout.on("data", (data) => {
  //         result += data.toString();
  //       });

  //       py.stderr.on("data", (err) => {
  //         console.error("Python Error:", err.toString());
  //         reject(err.toString());
  //       });

  //       py.on("close", () => {
  //         try {
  //           const parsed = JSON.parse(result);
  //           resolve(parsed.prediction);
  //         } catch {
  //           reject("Failed to parse prediction");
  //         }
  //       });

  //       py.stdin.write(JSON.stringify(transaction));
  //       py.stdin.end();
  //     } catch (error) {
  //       console.error("Failed to spawn Python script:", error);
  //       reject("Failed to spawn Python script");
  //     }
  //   });
  // }
}
