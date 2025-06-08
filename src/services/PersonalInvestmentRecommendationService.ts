import BaseService from "@/core/BaseService";
import { Service } from "typedi";
import { DeepPartial } from "typeorm";
import { PersonalInvestmentRecommendation } from "@/models/PersonalInvestmentRecommendation";
import { Customer } from "@/models/Customer";
import { spawn } from "child_process";

@Service()
export class PersonalInvestmentRecommendationService extends BaseService<PersonalInvestmentRecommendation> {
  constructor() {
    super(PersonalInvestmentRecommendation);
  }
  async create(
  data: DeepPartial<PersonalInvestmentRecommendation> & { customer: Customer }
): Promise<PersonalInvestmentRecommendation> {
  const existing = await this.repository.findOne({
    where: { customer: { id: data.customer.id } }
  });

  if (existing) {
    throw new Error("Customer has already submitted the investment questionnaire.");
  }

  const inputData = data.inputData;

  if (!inputData?.investmentCapacity || !inputData?.riskLevel || !inputData?.investmentPerspective) {
    throw new Error("Missing required questionnaire fields.");
  }

  const outputData = await this.generateRecommendations(data.customer.id, inputData.riskLevel);

  const record = this.repository.create({
    customer: data.customer,
    inputData,
    outputData
  });

  return await this.repository.save(record);
}


  // async create(
  //   data: DeepPartial<PersonalInvestmentRecommendation> & { customer: Customer }
  // ): Promise<PersonalInvestmentRecommendation> {
  //   const existing = await this.repository.findOne({
  //     where: { customer: { id: data.customer.id } }
  //   });

  //   if (existing) {
  //     throw new Error("Customer has already submitted the investment questionnaire.");
  //   }

  //   const inputData = {
  //     investmentCapacity: data.inputData?.investmentCapacity,
  //     riskLevel: data.inputData?.riskLevel,
  //     investmentPerspective: data.inputData?.investmentPerspective
  //   };

  //   if (!inputData.investmentCapacity || !inputData.riskLevel || !inputData.investmentPerspective) {
  //     throw new Error("Missing required questionnaire fields.");
  //   }

  //   const outputData = await this.generateRecommendations(data.customer.id, inputData.riskLevel);

  //   const record = this.repository.create({
  //     customer: data.customer,
  //     inputData,
  //     outputData
  //   });

  //   return await this.repository.save(record);
  // }

  private async generateRecommendations(
    customerID: string,
    riskLevel: string
  ): Promise<Record<string, any>[]> {
    return Array.from({ length: 5 }, (_, i) => ({
      UserID: customerID,
      RiskLevel: riskLevel,
      Rank: i + 1,
      ISIN: `ISIN${i + 1}`,
      AssetType: ["Stock", "Bond", "Mutual Fund", "ETF", "REIT"][i],
      Sector: ["Technology", "Finance", "Healthcare", "Energy", "Real Estate"][i],
      Industry: ["Software", "Banking", "Biotech", "Oil & Gas", "Commercial"][i],
      "ROI (%)": +(Math.random() * 15).toFixed(2)
    }));
  }

  /*
  private async callPythonModel(
    inputData: Record<string, any>
  ): Promise<Record<string, any>[]> {
    return new Promise((resolve, reject) => {
      try {
        const py = spawn("python", ["python/investmentModel.py"]);
        let result = "";

        py.stdout.on("data", (data) => {
          result += data.toString();
        });

        py.stderr.on("data", (err) => {
          reject(err.toString());
        });

        py.on("close", () => {
          try {
            const parsed = JSON.parse(result);
            resolve(parsed.recommendations);
          } catch {
            reject("Failed to parse AI model output");
          }
        });

        py.stdin.write(JSON.stringify(inputData));
        py.stdin.end();
      } catch (error) {
        reject("Failed to spawn Python script");
      }
    });
  }
  */
}
