import { BaseController } from "@/core/BaseController";
import { PersonalInvestmentRecommendation } from "@/models/PersonalInvestmentRecommendation";
import { CustomerService } from "@/services/CustomerService";
import { PersonalInvestmentRecommendationService } from "@/services/PersonalInvestmentRecommendationService";
import { Request } from "express";
import { Response } from "express-serve-static-core";
import Container, { Service } from "typedi";
import { FindOptionsWhere } from "typeorm";
import { z, ZodType } from "zod";

@Service()
export class PersonalInvestmentRecommendationController extends BaseController<PersonalInvestmentRecommendation> {
  private formSchema = z.object({
    customerID: z.string({ required_error: "Customer ID is required" }),
    ISIN: z.string(),
    riskLevel: z.string(),
    customerType: z.string(),
    investmentCapacity: z.string(),
    investmentPerspective: z.string(),
    transactionType: z.string(),
    profitability: z.number(),
    sector: z.string(),
    industry: z.string(),
    assetCategory: z.string(),
    timestamp: z.string().transform((val) => new Date(val))
  });

  public constructor() {
    super(PersonalInvestmentRecommendationService, {
      keySingle: "recommendation",
      keyPlural: "recommendations",
      schema: {} as unknown as ZodType<Partial<PersonalInvestmentRecommendation>>
    });
  }

  // protected override async validatePostBody(body: Request["body"]) {
  //   const parsedBody = await this.formSchema.parseAsync(body);

  //   const customerService = Container.get(CustomerService);
  //   const customer = await customerService.findById(parsedBody.customerID!);
  //   if (!customer) throw new Error("Customer not found");

  //   return {
  //     customer,
  //     inputData: parsedBody
  //   };
  // }
protected override async validatePostBody(body: Request["body"]) {
  const parsedBody = await this.formSchema.parseAsync(body);

  const customerService = Container.get(CustomerService);
  const customer = await customerService.findById(parsedBody.customerID);
  if (!customer) throw new Error("Customer not found");

  // احفظ كل البيانات في inputData بدون فك أو حذف
  const { customerID, ...inputData } = parsedBody;

  return {
    customer,
    inputData
  };
}
  protected override async getScopedWhere(
    req: Request
  ): Promise<FindOptionsWhere<PersonalInvestmentRecommendation>> {
    return { customer: { id: req.user!.id } };
  }

  public async post(req: Request, res: Response<any, Record<string, any>, number>): Promise<void> {
    try {
      const parsedBody = await this.validatePostBody(req.body);
      const entity = await this.service.create(parsedBody);
      res.status(201).json({ data: { recommendation: entity } });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: { message: error.message } });
      } else {
        res.status(500).json({ error: { message: "Internal server error" } });
      }
    }
  }
}
