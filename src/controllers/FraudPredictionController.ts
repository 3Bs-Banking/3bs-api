import { BaseController } from "@/core/BaseController";
import { FraudPrediction } from "@/models/FraudPrediction";
import { FraudPredictionService } from "@/services/FraudPredictionService";
import { Service } from "typedi";
import { z } from "zod";

@Service()
export class FraudPredictionController extends BaseController<FraudPrediction> {
  constructor() {
    super(FraudPredictionService, {
      keySingle: "fraudPrediction",
      keyPlural: "fraudPredictions",
      schema: z.object({
        transaction: z.object({
          merchant: z.string(),
          category: z.string(),
          amt: z.number(),
          gender: z.string(),
          lat: z.number(),
          long: z.number(),
          city_pop: z.number(),
          job: z.string(),
          unix_time: z.number(),
          merch_lat: z.number(),
          merch_long: z.number(),
          hour: z.number(),
          day: z.number(),
          month: z.number(),
          year: z.number(),
          age: z.number()
        })
      })
    });
  }
}
