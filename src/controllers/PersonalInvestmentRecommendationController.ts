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
  // Schema for questionnaire submission
  private submissionSchema = z.object({
    customerID: z.string({ required_error: "Customer ID is required" }),
    riskLevel: z.string({ required_error: "Risk level is required" }),
    investmentCapacity: z.union([
      z.number(),
      z.string().transform((val) => {
        console.log(`[InvestmentRecommendation] Parsing investment capacity: "${val}"`);
        
        const cleanValue = val.toString()
          .replace(/[^\d,.-]/g, '')
          .replace(/,/g, '');
        
        console.log(`[InvestmentRecommendation] Cleaned value: "${cleanValue}"`);
        
        const parsed = parseFloat(cleanValue);
        
        if (isNaN(parsed)) {
          throw new Error(`Invalid investment capacity format: "${val}". Expected format: "1,500,000 EGP" or "1500000"`);
        }
        
        console.log(`[InvestmentRecommendation] Parsed capacity: ${parsed} EGP`);
        return parsed;
      })
    ]).refine(val => val > 0, { message: "Investment capacity must be greater than 0" })
  });

  public constructor() {
    super(PersonalInvestmentRecommendationService, {
      keySingle: "recommendation",
      keyPlural: "recommendations",
      schema: {} as unknown as ZodType<Partial<PersonalInvestmentRecommendation>>
    });
  }

  private async validateSubmissionBody(body: Request["body"]) {
    console.log("[InvestmentRecommendation] Validating submission request body:", body);
    
    const parsedBody = await this.submissionSchema.parseAsync(body);

    // Get customer
    const customerService = Container.get(CustomerService);
    const customer = await customerService.findById(parsedBody.customerID);
    if (!customer) {
      throw new Error("Customer not found");
    }

    console.log(`[InvestmentRecommendation] Valid submission request for customer: ${customer.id}`);
    console.log(`[InvestmentRecommendation] Investment capacity: ${parsedBody.investmentCapacity} EGP`);
    console.log(`[InvestmentRecommendation] Risk level: ${parsedBody.riskLevel}`);

    // SMART CLASSIFICATION
    const customerType = this.classifyCustomerType(parsedBody.riskLevel, parsedBody.investmentCapacity);
    
    console.log(`[InvestmentRecommendation] 🎯 Auto-classified as: ${customerType}`);

    const modelInputData = {
      riskLevel: parsedBody.riskLevel,
      customerType: customerType,
      investmentCapacity: parsedBody.investmentCapacity,
      transactionType: "buy"
    };

    return {
      customer,
      inputData: modelInputData
    };
  }

  /**
   * Smart Customer Classification Metric
   */
  private classifyCustomerType(riskLevel: string, investmentCapacity: number): string {
    const risk = riskLevel.toLowerCase();
    
    console.log(`[InvestmentRecommendation] Smart Classification Metric - Risk: ${risk}, Capacity: ${investmentCapacity} EGP`);

    if (investmentCapacity < 5000) {
      console.log(`[InvestmentRecommendation] Classified as INACTIVE - Very low capacity (${investmentCapacity} EGP)`);
      return "Inactive";
    }
    
    if (investmentCapacity >= 2000000) {
      console.log(`[InvestmentRecommendation] Classified as PREMIUM - Ultra high capacity (${investmentCapacity} EGP)`);
      return "Premium";
    }
    
    if (investmentCapacity >= 500000 && (risk === "high" || risk === "aggressive" || risk === "growth")) {
      console.log(`[InvestmentRecommendation] Classified as PROFESSIONAL - High capacity + sophisticated risk profile`);
      return "Professional";
    }
    
    if (investmentCapacity >= 1000000) {
      console.log(`[InvestmentRecommendation] Classified as PROFESSIONAL - Very high capacity shows sophistication`);
      return "Professional";
    }
    
    if (investmentCapacity >= 5000 && investmentCapacity < 2000000) {
      console.log(`[InvestmentRecommendation] Classified as MASS - Typical retail investor (${investmentCapacity} EGP)`);
      return "Mass";
    }
    
    console.warn(`[InvestmentRecommendation] Edge case classification, defaulting to Mass`);
    return "Mass";
  }

  /**
   * SUBMIT questionnaire (POST) - Allows multiple submissions, prevents exact duplicates
   */
  public override async post(req: Request, res: Response<any, Record<string, any>, number>): Promise<void> {
    try {
      console.log("[InvestmentRecommendation] Processing questionnaire submission");
      
      const parsedBody = await this.validateSubmissionBody(req.body);
      const service = Container.get(PersonalInvestmentRecommendationService);
      const entity = await service.create(parsedBody);
      
      console.log(`[InvestmentRecommendation] Successfully created questionnaire submission for customer: ${entity.customer.id}`);
      
      res.status(201).json({ 
        data: { 
          recommendation: {
            id: entity.id,
            customer: entity.customer,
            inputData: entity.inputData,
            outputData: entity.outputData,
            timestamp: entity.timestamp
          }
        },
        message: "Investment questionnaire submitted successfully"
      });
    } catch (error) {
      console.error("[InvestmentRecommendation] Error submitting questionnaire:", error);
      
      if (error instanceof Error) {
        if (error.message.includes("already submitted a questionnaire with these exact same preferences")) {
          res.status(409).json({ 
            error: { 
              message: error.message,
              code: "DUPLICATE_SUBMISSION"
            } 
          });
        } else {
          res.status(400).json({ error: { message: error.message } });
        }
      } else {
        res.status(500).json({ error: { message: "Internal server error" } });
      }
    }
  }
}