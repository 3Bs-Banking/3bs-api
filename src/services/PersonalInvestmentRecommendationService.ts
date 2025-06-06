import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import BaseService from "@/core/BaseService";
import { PersonalInvestmentRecommendation } from '../models/PersonalInvestmentRecommendation';

@Service()
export class PersonalInvestmentRecommendationService extends BaseService<PersonalInvestmentRecommendation> {
  constructor(
    @InjectRepository(PersonalInvestmentRecommendation)
    private readonly pirRepository: Repository<PersonalInvestmentRecommendation>
  ) {
    super(PersonalInvestmentRecommendation);
  }
  private handleError(message: string, error: any): never {
    let errorMessage = message;
    if (error instanceof Error) {
      errorMessage = `${message}: ${error.message}`;
    } else if (typeof error === 'string') {
      errorMessage = `${message}: ${error}`;
    } else if (error?.message) {
      errorMessage = `${message}: ${error.message}`;
    }
    if (error?.code === '23505' || error?.code === 'ER_DUP_ENTRY') {
      errorMessage = `${message}: Duplicate record found`;
    }
    
    if (error?.code === '23503') {
      errorMessage = `${message}: Foreign key constraint violation`;
    }
    
    if (error?.message?.includes('AI') || error?.message?.includes('model')) {
      errorMessage = `${message}: AI service temporarily unavailable`;
    }
    
    throw new Error(errorMessage);
  }

  async getPersonalRecommendations(customerID?: string): Promise<any[]> {
  try {
    const latestUserAssetData = await this.getLatestUserAssetData(customerID);
    if (!latestUserAssetData.length) {
      throw new Error('No user asset data found');
    }

    const recommendations = await this.generateAIRecommendations(latestUserAssetData);
    return recommendations;
    } catch (error) {
    this.handleError('Failed to generate personal recommendations', error);
   }
  }

  private async getLatestUserAssetData(customerID?: string): Promise<any[]> {
    try {
      const queryBuilder = this.pirRepository.createQueryBuilder('pir');
      if (customerID) {
        queryBuilder.where('pir.customerID = :customerID', { customerID });
      }

      const records = await queryBuilder.orderBy('pir.timestamp', 'DESC').limit(100).getMany();
      return records.map(record => ({
        customerID: record.customerID,
        ISIN: record.ISIN,
        riskLevel: record.riskLevel,
        customerType: record.customerType,
        investmentCapacity: record.investmentCapacity,
        transactionType: record.transactionType,
        profitability: Number(record.profitability),
        sector: record.sector,
        industry: record.industry,
        assetCategory: record.assetCategory,
        timestamp: this.formatDateToDDMMYYYY(record.timestamp),
      }));
    } catch (error) {
      this.handleError('Failed to retrieve user asset data', error);
    }
  }

  private async generateAIRecommendations(userAssetData: any[]): Promise<any[]> {
    try {
      return await this.callAIModel(userAssetData);
    } catch (error) {
      this.handleError('AI model failed to generate recommendations', error);
    }
  }

  private async callAIModel(userAssetData: any[]): Promise<any[]> {
    // Replace with real AI call
    // Example structure for when you implement:
    /*
    try {
      const response = await fetch('your-ai-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAssetData })
      });
      
      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }
      
      const result = await response.json();
      return result.recommendations;
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
    */
    
    return [];
  }

  private formatDateToDDMMYYYY(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  async getRecommendationsByCustomerId(customerID: string): Promise<PersonalInvestmentRecommendation[]> {
    try {
      return await this.pirRepository.find({ 
        where: { customerID }, 
        order: { timestamp: 'DESC' } 
      });
    } catch (error) {
      this.handleError(`Failed to retrieve recommendations for customer ${customerID}`, error);
    }
  }

  async getLatestRecommendations(limit = 100): Promise<PersonalInvestmentRecommendation[]> {
    try {
      return await this.pirRepository.find({ 
        order: { timestamp: 'DESC' }, 
        take: limit 
      });
    } catch (error) {
      this.handleError('Failed to retrieve latest recommendations', error);
    }
  }
}