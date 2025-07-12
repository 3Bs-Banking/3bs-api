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

  /**
   * Get the latest forex prediction for a specific currency
   * @param req - Express request object with currency in query params
   * @param res - Express response object
   */
  public async getLast(req: Request, res: Response): Promise<void> {
    try {
      // Extract and validate currency from query params
      const currencyParam = req.query.currency as string | undefined;

      if (!currencyParam) {
        res.status(400).json({
          error: {
            message: "Missing query parameter: currency"
          }
        });
        return;
      }

      // Convert to uppercase
      const currencyUpper = currencyParam.toUpperCase();

      // Validate currency is either USD or GBP
      if (currencyUpper !== "USD" && currencyUpper !== "GBP") {
        res.status(400).json({
          error: {
            message: "Invalid currency. Must be either USD or GBP"
          }
        });
        return;
      }

      // Get the service instance
      const service = this.service as ForexPredictionService;

      // Get the latest prediction for the currency
      const latestPrediction = await service.getLatestByCurrency(
        currencyUpper as "USD" | "GBP"
      );

      if (!latestPrediction) {
        res.status(404).json({
          error: {
            message: `No forex prediction found for currency: ${currencyUpper}`
          }
        });
        return;
      }

      // Return the response with required fields
      res.json({
        data: {
          open: latestPrediction.open,
          high: latestPrediction.high,
          low: latestPrediction.low,
          closing: latestPrediction.predictedClose || null
        }
      });
    } catch {
      res.status(500).json({
        error: {
          message: "Internal server error"
        }
      });
    }
  }
}
