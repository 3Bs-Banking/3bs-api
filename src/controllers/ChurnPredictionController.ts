import { BaseController } from "@/core/BaseController";
import { ChurnPrediction } from "@/models/ChurnPrediction";
import { ChurnPredictionService } from "@/services/ChurnPredictionService";
import { Service } from "typedi";
import { z } from "zod";

@Service()
export class ChurnPredictionController extends BaseController<ChurnPrediction> {
  constructor() {
    super(ChurnPredictionService, {
      keySingle: "churnPrediction",
      keyPlural: "churnPredictions",
      schema: z.object({
        customerProfile: z.object({
          // Profile
          Customer_Age: z.number(),
          Gender: z.number(),
          Dependent_count: z.number(),
          Months_on_book: z.number(),
          Months_Inactive_12_mon: z.number(),
          Total_Relationship_Count: z.number(),
          Contacts_Count_12_mon: z.number(),

          // Credit Behavior
          Credit_Limit: z.number(),
          Total_Revolving_Bal: z.number(),
          Avg_Open_To_Buy: z.number(),
          Total_Amt_Chng_Q4_Q1: z.number(),
          Total_Trans_Amt: z.number(),
          Total_Trans_Ct: z.number(),
          Total_Ct_Chng_Q4_Q1: z.number(),
          Avg_Utilization_Ratio: z.number(),

          // Education (one-hot)
          Education_Level_Doctorate: z.number(),
          Education_Level_Graduate: z.number(),
          Education_Level_High_School: z.number(),
          Education_Level_Post_Graduate: z.number(),
          Education_Level_Uneducated: z.number(),
          Education_Level_Unknown: z.number(),

          // Marital Status (one-hot)
          Marital_Status_Married: z.number(),
          Marital_Status_Single: z.number(),
          Marital_Status_Unknown: z.number(),

          // Income Category (quoted keys)
          "Income_Category_$40K_-_$60K": z.number(),
          "Income_Category_$60K_-_$80K": z.number(),
          "Income_Category_$80K_-_$120K": z.number(),
          "Income_Category_Less_than_$40K": z.number(),
          "Income_Category_Unknown": z.number(),

          // Card Category (one-hot)
          Card_Category_Gold: z.number(),
          Card_Category_Platinum: z.number(),
          Card_Category_Silver: z.number()
        })
      })
    });
  }
}
