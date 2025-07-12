import { BaseController } from "@/core/BaseController";
import { FraudPrediction } from "@/models/FraudPrediction";
import { UserRole } from "@/models/User";
import { FraudPredictionService } from "@/services/FraudPredictionService";
import { UserService } from "@/services/UserService";
import { Request, Response } from "express";
import Container, { Service } from "typedi";
import { FindOptionsWhere } from "typeorm";
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
        }),
        bankId: z.string()
      })
    });
  }

  protected override async getScopedWhere(
    req: Request
  ): Promise<FindOptionsWhere<FraudPrediction> | null> {
    const user = (await Container.get(UserService).findById(req.user!.id, {
      bank: true,
      branch: true
    }))!;

    if (user.role === UserRole.ADMIN) return { bank: { id: user.bank.id } };

    return null;
  }

  public async getCount(req: Request, res: Response) {
    const scopedWhere = await this.getScopedWhere(req);

    let count = 0;

    if (scopedWhere !== null)
      count = await this.service.count(
        { ...scopedWhere, prediction: "Fraud" },
        { bank: true }
      );

    res.json({ data: { count } });
  }

  public async getRate(req: Request, res: Response) {
    const scopedWhere = await this.getScopedWhere(req);

    let fraudCount = 0,
      notFraudCount = 0;

    if (scopedWhere !== null) {
      fraudCount = await this.service.count(
        { ...scopedWhere, prediction: "Fraud" },
        { bank: true }
      );
      notFraudCount = await this.service.count(
        { ...scopedWhere, prediction: "Not Fraud" },
        { bank: true }
      );
    }

    const denominator = fraudCount + notFraudCount;

    let rate = 0;
    if (denominator !== 0) rate = fraudCount / denominator;

    res.json({ data: { rate } });
  }
}
