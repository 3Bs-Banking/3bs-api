import { BaseController } from "@/core/BaseController";
import { ForexPrediction } from "@/models/ForexPrediction";
import { ForexPredictionService } from "@/services/ForexPredictionService";
import { Request, Response } from "express";
import { Service } from "typedi";
import { z } from "zod";

@Service()
export class ForexPredictionController extends BaseController<ForexPrediction> {
  constructor() {
    super(ForexPredictionService, {
      keySingle: "forexPrediction",
      keyPlural: "forexPredictions",
      schema: z.object({
        currency: z.enum(["USD", "GBP"]),
        open: z.number(),
        high: z.number(),
        low: z.number()
      })
    });
  }
}
