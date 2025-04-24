import BaseService from "@/core/BaseService";
import { FraudPrediction } from "@/models/FraudPrediction";
import { Service } from "typedi";
import { spawn } from "child_process";

@Service()
export class FraudPredictionService extends BaseService<FraudPrediction> {
  constructor() {
    super(FraudPrediction);
  }

  /**
   * Loads a transaction from a JSON file and saves the prediction in the database.
   * @param filePath - Path to the JSON file containing the transaction.
   * @returns The saved FraudPrediction record.
   */
  async predictAndSaveFromJsonFile(filePath: string): Promise<FraudPrediction> {
    try {
      const transaction = await this.loadJson(filePath);
      const prediction = await this.callPythonModel(transaction);
      return await this.create({ transaction, prediction });
    } catch (error) {
      console.error("Error during prediction:", error);
      throw error;
    }
  }

  /**
   * Reads a JSON file from disk and parses it into an object.
   * @param filePath - Path to the JSON file.
   * @returns Parsed transaction object.
   */
  private async loadJson(filePath: string): Promise<Record<string, any>> {
    try {
      const fs = await import("fs/promises");
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to read or parse transaction file:", error);
      throw error;
    }
  }

  /**
   * Sends a transaction object to a Python script and retrieves the prediction result.
   * @param transaction - Transaction object.
   * @returns "Fraud" or "Not Fraud" based on the model output.
   */
  private async callPythonModel(transaction: Record<string, any>): Promise<"Fraud" | "Not Fraud"> {
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
            if (e instanceof Error) {
              reject("Failed to parse prediction: " + e.message);
            } else {
              reject("Failed to parse prediction: unknown error");
            }
          }
        });

        // Send transaction to Python stdin
        py.stdin.write(JSON.stringify(transaction));
        py.stdin.end();
      } catch (error) {
        console.error("Failed to spawn Python script:", error);
        reject("Failed to spawn Python script");
      }
    });
  }
}
