import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { z } from 'zod';
import { BaseController } from '@/core/BaseController';
import { PersonalInvestmentRecommendationService } from '@/services/PersonalInvestmentRecommendationService';
import { PersonalInvestmentRecommendation } from '@/models/PersonalInvestmentRecommendation';

// Zod Schemas
const GetPersonalRecommendationQuerySchema = z.object({
  customerID: z.string().min(1, 'Customer ID is required').optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100)).optional().default('5')
});

const AIRecommendationSchema = z.object({
  UserID: z.string(),
  ISIN: z.string(),
  AssetType: z.string(),
  Sector: z.string(),
  Industry: z.string(),
  ROI: z.number(),
  Rank: z.number().min(1).max(5),
  RiskLevel: z.string()
});

const PersonalRecommendationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    recommendations: z.array(AIRecommendationSchema),
    totalCount: z.number(),
    generatedAt: z.string()
  })
});

export type PersonalRecommendationResponse = z.infer<typeof PersonalRecommendationResponseSchema>;

export class PersonalInvestmentRecommendationController extends BaseController<PersonalInvestmentRecommendation> {
  private readonly pirService: PersonalInvestmentRecommendationService;

  constructor() {
    super(class {} as any, {
      keySingle: 'recommendation',
      keyPlural: 'recommendations',
      schema: AIRecommendationSchema
    });

    this.pirService = Container.get(PersonalInvestmentRecommendationService);
  }
  // ✅ Added handleError method
  private handleError(error: unknown, next: NextFunction): void {
    console.error('PIR Controller Error:', error);
    next(error);
  }

  getPersonalRecommendations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validatedQuery = GetPersonalRecommendationQuerySchema.parse(req.query);
      const recommendations = await this.pirService.getPersonalRecommendations(validatedQuery.customerID);
      const response: PersonalRecommendationResponse = {
        success: true,
        message: 'Personal investment recommendations retrieved successfully',
        data: {
          recommendations,
          totalCount: recommendations.length,
          generatedAt: new Date().toISOString()
        }
      };
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, next);
    }
  };

  getCustomerRecommendations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { customerID } = req.params;
          if (!customerID) {
      res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
      return;
    }



      const recommendations = await this.pirService.getPersonalRecommendations(customerID);
      const response: PersonalRecommendationResponse = {
        success: true,
        message: `Personal investment recommendations for customer ${customerID} retrieved successfully`,
        data: {
          recommendations,
          totalCount: recommendations.length,
          generatedAt: new Date().toISOString()
        }
      };

      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, next);
    }
  };
}
