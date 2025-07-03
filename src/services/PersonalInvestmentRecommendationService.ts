import BaseService from "@/core/BaseService";
import { Service } from "typedi";
import { DeepPartial } from "typeorm";
import { PersonalInvestmentRecommendation } from "@/models/PersonalInvestmentRecommendation";
import { Customer } from "@/models/Customer";

interface ModelInput {
  riskLevel: string;
  customerType: string;
  investmentCapacity: number;
  transactionType: string;
}

interface RecommendationOutput {
  ISIN: string;
  AssetType: string;
  Sector: string;
  Industry: string;
  "ROI (%)": number;
}

@Service()
export class PersonalInvestmentRecommendationService extends BaseService<PersonalInvestmentRecommendation> {
  constructor() {
    super(PersonalInvestmentRecommendation);
  }

  /**
   * CREATE new questionnaire submission (allows multiple submissions)
   * Only prevents exact duplicates
   */
  async create(
    data: DeepPartial<PersonalInvestmentRecommendation> & { 
      customer: Customer;
      inputData: ModelInput;
    }
  ): Promise<PersonalInvestmentRecommendation> {
    console.log(`[InvestmentRecommendation] Processing submission for customer ${data.customer.id}`);

    // Check for exact duplicate submissions
    const isDuplicate = await this.checkForDuplicate(data.customer.id, data.inputData);
    
    if (isDuplicate) {
      console.log(`[InvestmentRecommendation] Duplicate submission detected for customer ${data.customer.id}`);
      throw new Error("You have already submitted a questionnaire with these exact same preferences. Please modify your risk level or investment capacity if you want to submit again.");
    }

    console.log(`[InvestmentRecommendation] Creating new submission for customer ${data.customer.id}`);
    return await this.createNewSubmission(data);
  }

  /**
   * Check if exact same submission already exists for this customer
   */
  private async checkForDuplicate(customerId: string, newInputData: ModelInput): Promise<boolean> {
    console.log(`[InvestmentRecommendation] Checking for duplicate submission for customer ${customerId}`);
    
    // Find all submissions for this customer
    const existingSubmissions = await this.repository.find({
      where: { customer: { id: customerId } }
    });

    // Check if any existing submission has exact same data
    for (const submission of existingSubmissions) {
      if (this.isSameData(submission.inputData, newInputData)) {
        console.log(`[InvestmentRecommendation] Found duplicate submission with ID: ${submission.id}`);
        return true;
      }
    }

    console.log(`[InvestmentRecommendation] No duplicate found, submission is unique`);
    return false;
  }

  /**
   * Check if two input data objects are identical
   */
  private isSameData(existingData: any, newData: ModelInput): boolean {
    const sameRiskLevel = existingData.riskLevel === newData.riskLevel;
    const sameCustomerType = existingData.customerType === newData.customerType;
    const sameCapacity = existingData.investmentCapacity === newData.investmentCapacity;
    const sameTransactionType = existingData.transactionType === newData.transactionType;
    
    return sameRiskLevel && sameCustomerType && sameCapacity && sameTransactionType;
  }

  /**
   * Create a new submission
   */
  private async createNewSubmission(
    data: DeepPartial<PersonalInvestmentRecommendation> & { 
      customer: Customer;
      inputData: ModelInput;
    }
  ): Promise<PersonalInvestmentRecommendation> {
    const { riskLevel, customerType, investmentCapacity, transactionType } = data.inputData;

    if (!riskLevel || !customerType || !investmentCapacity || !transactionType) {
      throw new Error("All input fields are required.");
    }

    console.log(`[InvestmentRecommendation] Creating submission for customer ${data.customer.id}:`);
    console.log(`[InvestmentRecommendation] - Risk Level: ${riskLevel}`);
    console.log(`[InvestmentRecommendation] - Customer Type: ${customerType} (auto-classified)`);
    console.log(`[InvestmentRecommendation] - Investment Capacity: ${investmentCapacity} EGP`);
    console.log(`[InvestmentRecommendation] - Transaction Type: ${transactionType}`);

    // Generate recommendations
    const outputData = await this.generateRecommendations(data.inputData);

    // Create and save the record
    const record = this.repository.create({
      customer: data.customer,
      inputData: data.inputData,
      outputData
    });

    const savedRecord = await this.repository.save(record);
    console.log(`[InvestmentRecommendation] Successfully created submission with ${outputData.length} recommendations for customer ${data.customer.id}`);

    return savedRecord;
  }

  /**
   * Find all submissions by customer ID
   */
  async findAllByCustomerId(customerId: string): Promise<PersonalInvestmentRecommendation[]> {
    console.log(`[InvestmentRecommendation] Finding all submissions for customer: ${customerId}`);
    
    return await this.repository.find({
      where: { customer: { id: customerId } },
      relations: ["customer"],
      order: { timestamp: "DESC" } // Most recent first
    });
  }

  /**
   * Find latest submission by customer ID
   */
  async findLatestByCustomerId(customerId: string): Promise<PersonalInvestmentRecommendation | null> {
    console.log(`[InvestmentRecommendation] Finding latest submission for customer: ${customerId}`);
    
    const latest = await this.repository.findOne({
      where: { customer: { id: customerId } },
      relations: ["customer"],
      order: { timestamp: "DESC" } // Most recent first
    });

    if (latest) {
      console.log(`[InvestmentRecommendation] Found latest submission for customer ${customerId}: ${latest.id}`);
    } else {
      console.log(`[InvestmentRecommendation] No submissions found for customer: ${customerId}`);
    }

    return latest;
  }

  /**
   * Generate investment recommendations by sending classified data to ML model
   */
  private async generateRecommendations(
    modelInput: ModelInput
  ): Promise<RecommendationOutput[]> {
    console.log(`[InvestmentRecommendation] Sending classified data to ML model:`);
    console.log(`[InvestmentRecommendation] - Customer Type: ${modelInput.customerType}`);
    console.log(`[InvestmentRecommendation] - Risk Level: ${modelInput.riskLevel}`);
    console.log(`[InvestmentRecommendation] - Investment Capacity: ${modelInput.investmentCapacity} EGP`);
    console.log(`[InvestmentRecommendation] - Transaction Type: ${modelInput.transactionType}`);

    return await this.callMLModel(modelInput);
  }

  /**
   * Call ML Model with classified customer data
   */
  private async callMLModel(modelInput: ModelInput): Promise<RecommendationOutput[]> {
    console.log(`[InvestmentRecommendation] Calling ML model with classified customer type: ${modelInput.customerType}`);
    
    // TODO: Uncomment when Python model is ready
    // return await this.callPythonModel(modelInput);
    
    return this.generateMockRecommendations(modelInput);
  }

  /**
   * Generate mock recommendations based on classified customer type
   */
  private generateMockRecommendations(modelInput: ModelInput): RecommendationOutput[] {
    const { riskLevel, customerType, investmentCapacity, transactionType } = modelInput;
    
    console.log(`[InvestmentRecommendation] Mock ML Model processing classified customer: ${customerType}`);
    
    const recommendations = this.getRecommendationsByCustomerType(customerType, investmentCapacity, riskLevel);
    
    console.log(`[InvestmentRecommendation] Mock ML Model generated ${recommendations.length} recommendations for ${customerType}`);
    
    return recommendations;
  }

  /**
   * Get recommendations based on customer type
   */
  private getRecommendationsByCustomerType(
    customerType: string, 
    capacity: number, 
    riskLevel: string
  ): RecommendationOutput[] {
    console.log(`[InvestmentRecommendation] ML Model processing customer classification: ${customerType}`);
    
    let strategy: {
      assetTypes: string[];
      sectors: string[];
      roiRange: { min: number; max: number };
      riskAdjustment: number;
    };

    switch (customerType) {
      case "Premium":
        strategy = {
          assetTypes: ["Growth Stock", "Investment Fund", "Corporate Bond"],
          sectors: ["Technology", "Healthcare", "Finance", "International Markets", "Energy"],
          roiRange: { min: 85, max: 97.4 }, // Top tier: 85% - 97.4%
          riskAdjustment: 1.0
        };
        break;

      case "Professional":
        strategy = {
          assetTypes: ["Growth Stock", "Investment Fund", "Corporate Bond"],
          sectors: ["Technology", "Healthcare", "Finance", "Clean Energy", "Emerging Markets"],
          roiRange: { min: 70, max: 88 }, // High tier: 70% - 88%
          riskAdjustment: 1.0
        };
        break;

      case "Mass":
        strategy = {
          assetTypes: ["Investment Fund", "Blue Chip Stock", "Corporate Bond"],
          sectors: ["Technology", "Healthcare", "Finance", "Consumer Goods", "Industrials"],
          roiRange: { min: 55, max: 75 }, // Mid tier: 55% - 75%
          riskAdjustment: 1.0
        };
        break;

      case "Inactive":
        strategy = {
          assetTypes: ["Government Bond", "Investment Fund", "Blue Chip Stock"],
          sectors: ["Government Securities", "Banking", "Utilities", "Consumer Staples", "Finance"],
          roiRange: { min: 40, max: 60 }, // Lower tier: 40% - 60%
          riskAdjustment: 1.0
        };
        break;

      default:
        console.warn(`[InvestmentRecommendation] Unknown customer type: ${customerType}, using Mass strategy`);
        strategy = {
          assetTypes: ["Investment Fund", "Stock", "Bond"],
          sectors: ["Technology", "Healthcare", "Finance", "Consumer Goods", "Industrials"],
          roiRange: { min: 55, max: 75 },
          riskAdjustment: 1.0
        };
    }

    strategy = this.adjustStrategyByRiskLevel(strategy, riskLevel);

    console.log(`[InvestmentRecommendation] Using strategy for ${customerType}: ROI ${strategy.roiRange.min}-${strategy.roiRange.max}%`);

    // Generate 5 varied ROI values in descending order (highest first)
    const roiValues = this.generateDescendingROIValues(strategy.roiRange.min, strategy.roiRange.max);

    return Array.from({ length: 5 }, (_, i) => {
      return {
        ISIN: `EG${customerType.toUpperCase().slice(0, 3)}${Date.now().toString().slice(-4)}${(i + 1).toString().padStart(2, '0')}`,
        AssetType: strategy.assetTypes[i % strategy.assetTypes.length],
        Sector: strategy.sectors[i % strategy.sectors.length],
        Industry: this.getIndustryBySector(strategy.sectors[i % strategy.sectors.length]),
        "ROI (%)": roiValues[i]
      };
    });
  }

  /**
   * Generate 5 varied ROI values in descending order (highest first)
   * Top 20% range with highest being 97.4%
   */
  private generateDescendingROIValues(min: number, max: number): number[] {
    const range = max - min;
    const step = range / 4; // Divide range into 4 steps for 5 values
    
    // Generate 5 values with some randomization but in descending order
    const values = [
      max, // Highest value (first)
      max - step + (Math.random() - 0.5) * (step * 0.3), // Second highest with variation
      max - (step * 2) + (Math.random() - 0.5) * (step * 0.3), // Third
      max - (step * 3) + (Math.random() - 0.5) * (step * 0.3), // Fourth  
      min + (Math.random() * step * 0.5) // Fifth (lowest but still in range)
    ];

    // Ensure all values are within bounds and format to 1 decimal place
    return values.map((value, index) => {
      let adjustedValue = Math.max(min, Math.min(max, value));
      
      // For Premium customer type, ensure the first value can be 97.4%
      if (max >= 97.4 && index === 0) {
        adjustedValue = 97.4;
      }
      
      return +adjustedValue.toFixed(1);
    });
  }

  /**
   * Adjust strategy based on risk level
   */
  private adjustStrategyByRiskLevel(
    strategy: { assetTypes: string[]; sectors: string[]; roiRange: { min: number; max: number }; riskAdjustment: number },
    riskLevel: string
  ) {
    const risk = riskLevel.toLowerCase();
    
    if (risk === "low" || risk === "conservative") {
      // Conservative: Shift range down but keep it in the top 20%
      strategy.roiRange.min = Math.max(strategy.roiRange.min - 10, 40);
      strategy.roiRange.max = Math.max(strategy.roiRange.max - 8, strategy.roiRange.min + 15);
    } else if (risk === "high" || risk === "aggressive" || risk === "growth") {
      // Aggressive: Shift range up toward maximum
      strategy.roiRange.min = Math.min(strategy.roiRange.min + 5, 90);
      strategy.roiRange.max = Math.min(strategy.roiRange.max + 8, 97.4);
    }
    
    return strategy;
  }

  /**
   * Get industry by sector
   */
  private getIndustryBySector(sector: string): string {
    const industryMap: { [key: string]: string[] } = {
      "Technology": ["Software Development", "Cloud Computing", "Cybersecurity", "Artificial Intelligence", "Semiconductors"],
      "Healthcare": ["Pharmaceuticals", "Medical Devices", "Digital Health", "Biotechnology", "Healthcare Services"],
      "Finance": ["Digital Banking", "Investment Banking", "Insurance", "Asset Management", "Financial Services"],
      "Government Securities": ["Treasury Securities", "Municipal Bonds", "Government Services", "Public Infrastructure", "Sovereign Debt"],
      "Banking": ["Commercial Banking", "Investment Banking", "Islamic Banking", "Digital Banking", "Financial Services"],
      "Utilities": ["Electric Power", "Water Services", "Gas Distribution", "Renewable Energy", "Telecommunications"],
      "Consumer Staples": ["Food & Beverages", "Personal Care", "Household Products", "Agriculture", "Retail"],
      "Consumer Goods": ["E-commerce", "Entertainment", "Automotive", "Retail", "Consumer Products"],
      "Industrials": ["Manufacturing", "Construction", "Aerospace", "Transportation", "Industrial Equipment"],
      "Clean Energy": ["Solar Power", "Wind Energy", "Energy Storage", "Renewable Energy", "Green Technology"],
      "Emerging Markets": ["Emerging Asia", "MENA Region", "Latin America", "Frontier Markets", "Developing Markets"],
      "International Markets": ["Global Equities", "International Funds", "Global Markets", "Foreign Markets", "International Securities"],
      "Energy": ["Oil & Gas", "Energy Production", "Energy Distribution", "Renewable Energy", "Energy Services"]
    };

    const industries = industryMap[sector] || ["General Industry"];
    return industries[Math.floor(Math.random() * industries.length)];
  }

  /*
  // TODO: Uncomment and implement when Python model is ready
  private async callPythonModel(
    modelInput: ModelInput
  ): Promise<RecommendationOutput[]> {
    console.log(`[InvestmentRecommendation] Calling Python ML model with classified customer data:`);
    console.log(`[InvestmentRecommendation] Customer Type: ${modelInput.customerType}`);
    console.log(`[InvestmentRecommendation] Risk Level: ${modelInput.riskLevel}`);
    console.log(`[InvestmentRecommendation] Investment Capacity: ${modelInput.investmentCapacity} EGP`);
    console.log(`[InvestmentRecommendation] Transaction Type: ${modelInput.transactionType}`);
    
    return new Promise((resolve, reject) => {
      try {
        const py = spawn("python", ["python/investmentModel.py"]);
        let result = "";

        py.stdout.on("data", (data) => {
          result += data.toString();
        });

        py.stderr.on("data", (err) => {
          console.error("[InvestmentRecommendation] Python model error:", err.toString());
          reject("Investment model execution failed");
        });

        py.on("close", (code) => {
          try {
            if (code !== 0) {
              console.error(`[InvestmentRecommendation] Python model exited with code ${code}`);
              reject(`Python model exited with code ${code}`);
              return;
            }
            
            const parsed = JSON.parse(result);
            if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
              console.log(`[InvestmentRecommendation] Python model returned ${parsed.recommendations.length} recommendations`);
              resolve(parsed.recommendations);
            } else {
              console.error("[InvestmentRecommendation] Invalid model response format:", parsed);
              reject("Invalid model response format");
            }
          } catch (error) {
            console.error("[InvestmentRecommendation] Failed to parse Python model output:", error);
            reject("Failed to parse investment model output");
          }
        });

        const inputJson = JSON.stringify(modelInput);
        console.log(`[InvestmentRecommendation] Sending to Python model:`, inputJson);
        
        py.stdin.write(inputJson);
        py.stdin.end();
      } catch (error) {
        console.error("[InvestmentRecommendation] Failed to execute Python model:", error);
        reject("Failed to execute investment model");
      }
    });
  }
  */
}