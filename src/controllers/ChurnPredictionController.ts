import { BaseController } from "@/core/BaseController";
import { ChurnPrediction } from "@/models/ChurnPrediction";
import { ChurnPredictionService } from "@/services/ChurnPredictionService";
import { Service } from "typedi";
import { Request, Response } from "express";
import { z } from "zod";

@Service()
export class ChurnPredictionController extends BaseController<ChurnPrediction> {
  constructor() {
    super(ChurnPredictionService, {
      keySingle: "churnPrediction",
      keyPlural: "churnPredictions",
      schema: z.object({
        customerId: z.string().uuid().optional(),
        customerProfile: z.object({
          // Demographics - Core customer information
          Customer_Age: z.number().min(18).max(100),
          Gender: z.number().min(0).max(1), // 0 = Female, 1 = Male
          Dependent_count: z.number().min(0).max(10),

          // Account Tenure & Activity Metrics
          Months_on_book: z.number().min(1).max(120), // How long customer has been with bank
          Months_Inactive_12_mon: z.number().min(0).max(12), // Inactive months in last year
          Total_Relationship_Count: z.number().min(1).max(10), // Number of products with bank
          Contacts_Count_12_mon: z.number().min(0).max(50), // Customer service contacts

          // Financial Behavior & Credit Metrics
          Credit_Limit: z.number().min(1000).max(100000), // Credit card limit
          Total_Revolving_Bal: z.number().min(0).max(100000), // Current revolving balance
          Avg_Open_To_Buy: z.number().min(0).max(100000), // Available credit
          Total_Amt_Chng_Q4_Q1: z.number().min(0).max(5), // Transaction amount change ratio
          Total_Trans_Amt: z.number().min(0).max(50000), // Total transaction amount
          Total_Trans_Ct: z.number().min(0).max(200), // Total transaction count
          Total_Ct_Chng_Q4_Q1: z.number().min(0).max(5), // Transaction count change ratio
          Avg_Utilization_Ratio: z.number().min(0).max(1), // Credit utilization ratio

          // Education Level (One-hot encoded - exactly one should be 1)
          Education_Level_Doctorate: z.number().min(0).max(1),
          Education_Level_Graduate: z.number().min(0).max(1),
          Education_Level_High_School: z.number().min(0).max(1),
          Education_Level_Post_Graduate: z.number().min(0).max(1),
          Education_Level_Uneducated: z.number().min(0).max(1),
          Education_Level_Unknown: z.number().min(0).max(1),

          // Marital Status (One-hot encoded - exactly one should be 1)
          Marital_Status_Married: z.number().min(0).max(1),
          Marital_Status_Single: z.number().min(0).max(1),
          Marital_Status_Unknown: z.number().min(0).max(1),

          // Income Categories (One-hot encoded - exactly one should be 1)
          "Income_Category_$40K_-_$60K": z.number().min(0).max(1),
          "Income_Category_$60K_-_$80K": z.number().min(0).max(1),
          "Income_Category_$80K_-_$120K": z.number().min(0).max(1),
          Income_Category_Less_than_$40K: z.number().min(0).max(1),
          Income_Category_Unknown: z.number().min(0).max(1),

          // Card Categories (One-hot encoded - exactly one should be 1)
          Card_Category_Gold: z.number().min(0).max(1),
          Card_Category_Platinum: z.number().min(0).max(1),
          Card_Category_Silver: z.number().min(0).max(1)
        })
      }),
      relations: {
        customer: true // Include customer information in responses
      }
    });
  }

  /**
   * Enhanced validation for customer profile with business rules
   */
  protected async validatePostBody(body: any) {
    const validatedBody = await super.validatePostBody(body);

    // Additional business rule validations
    this.validateOneHotEncoding(
      validatedBody.customerProfile,
      "Education_Level"
    );
    this.validateOneHotEncoding(
      validatedBody.customerProfile,
      "Marital_Status"
    );
    this.validateOneHotEncoding(
      validatedBody.customerProfile,
      "Income_Category"
    );
    this.validateOneHotEncoding(validatedBody.customerProfile, "Card_Category");

    this.validateFinancialConsistency(validatedBody.customerProfile);

    return validatedBody;
  }

  /**
   * Validates one-hot encoding - exactly one field should be 1
   */
  private validateOneHotEncoding(profile: any, prefix: string) {
    const fields = Object.keys(profile).filter((key) => key.startsWith(prefix));
    const activeCount = fields.reduce((sum, field) => sum + profile[field], 0);

    if (activeCount !== 1) {
      throw new Error(
        `Invalid ${prefix} encoding: exactly one field must be 1, got ${activeCount}`
      );
    }
  }

  /**
   * Validates financial data consistency
   */
  private validateFinancialConsistency(profile: any) {
    // Credit limit should be greater than revolving balance
    if (profile.Total_Revolving_Bal > profile.Credit_Limit) {
      throw new Error("Total revolving balance cannot exceed credit limit");
    }

    // Available credit should be consistent
    const expectedAvailableCredit =
      profile.Credit_Limit - profile.Total_Revolving_Bal;
    const tolerance = 100; // Allow small rounding differences

    if (
      Math.abs(profile.Avg_Open_To_Buy - expectedAvailableCredit) > tolerance
    ) {
      throw new Error(
        "Average open to buy amount is inconsistent with credit limit and balance"
      );
    }

    // Utilization ratio should be consistent
    const expectedUtilization =
      profile.Total_Revolving_Bal / profile.Credit_Limit;
    if (Math.abs(profile.Avg_Utilization_Ratio - expectedUtilization) > 0.05) {
      throw new Error(
        "Utilization ratio is inconsistent with balance and credit limit"
      );
    }

    // Transaction ratios should be reasonable
    if (profile.Total_Amt_Chng_Q4_Q1 > 10 || profile.Total_Ct_Chng_Q4_Q1 > 10) {
      throw new Error(
        "Transaction change ratios seem unrealistic (>1000% change)"
      );
    }

    // Age should be reasonable for financial products
    if (profile.Customer_Age < 18) {
      throw new Error(
        "Customer age must be at least 18 for financial products"
      );
    }
  }

  public async getCount(req: Request, res: Response) {
    const scopedWhere = await this.getScopedWhere(req);

    let count = 0;

    if (scopedWhere !== null)
      count = await this.service.count({ ...scopedWhere, prediction: "Churn" });

    res.json({ data: { count } });
  }

  public async getRate(req: Request, res: Response) {
    const scopedWhere = await this.getScopedWhere(req);

    let churnCount = 0,
      notChurnCount = 0;

    if (scopedWhere !== null) {
      churnCount = await this.service.count({
        ...scopedWhere,
        prediction: "Churn"
      });
      notChurnCount = await this.service.count({
        ...scopedWhere,
        prediction: "No Churn"
      });
    }

    const denominator = churnCount + notChurnCount;

    let rate = 0;
    if (denominator !== 0) rate = churnCount / denominator;

    res.json({ data: { rate } });
  }
}
