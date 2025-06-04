import BaseService from "@/core/BaseService";
import { ChurnPrediction } from "@/models/ChurnPrediction";
import { Service } from "typedi";
import { spawn } from "child_process";
import { DeepPartial } from "typeorm";

@Service()
export class ChurnPredictionService extends BaseService<ChurnPrediction> {
  constructor() {
    super(ChurnPrediction);
  }

  async create(data: DeepPartial<ChurnPrediction>): Promise<ChurnPrediction> {
    if (!data.customerProfile) {
      throw new Error("Missing customer profile data.");
    }

    const prediction = await this.callPythonModel(data.customerProfile);

    const record = this.repository.create({
      ...data,
      prediction
    });

    return await this.repository.save(record);
  }
  
  private async callPythonModel(
  customerProfile: Record<string, any>
): Promise<"Churn" | "No Churn"> {
  if (customerProfile.Total_Trans_Amt > 3000) {
    return "Churn";
  }
  if (customerProfile.Avg_Utilization_Ratio > 0.5) {
    return "Churn";
  }
  if (customerProfile.Months_Inactive_12_mon > 6) {
    return "Churn";
  }
  return "No Churn";
}


  // private async callPythonModel(
  //   customerProfile: Record<string, any>
  // ): Promise<"Churn" | "No Churn"> {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       const py = spawn("python", ["python/churnModel.py"]);
  //       let result = "";

  //       py.stdout.on("data", (data) => {
  //         result += data.toString();
  //       });

  //       py.stderr.on("data", (err) => {
  //         console.error("Python Error:", err.toString());
  //         reject("Python script error: " + err.toString());
  //       });

  //       py.on("close", () => {
  //         try {
  //           const parsed = JSON.parse(result);
  //           const value = parsed.prediction;
  //           if (value === "Churn" || value === "No Churn") {
  //             resolve(value);
  //           } else {
  //             reject("Unexpected prediction value: " + value);
  //           }
  //         } catch {
  //           reject("Failed to parse Python output.");
  //         }
  //       });

  //       py.stdin.write(JSON.stringify(customerProfile));
  //       py.stdin.end();
  //     } catch (error) {
  //       console.error("Spawn error:", error);
  //       reject("Failed to run Python model");
  //     }
  //   });
  // }
}
