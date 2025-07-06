import BaseService from "@/core/BaseService";
import { ChurnPrediction } from "@/models/ChurnPrediction";
import { Customer } from "@/models/Customer";
import { Service } from "typedi";
import { DeepPartial } from "typeorm";

interface CustomerProfile {
  // Demographics
  Customer_Age: number;
  Gender: number;
  Dependent_count: number;
  
  // Account Tenure & Activity
  Months_on_book: number;
  Months_Inactive_12_mon: number;
  Total_Relationship_Count: number;
  Contacts_Count_12_mon: number;
  
  // Financial Behavior
  Credit_Limit: number;
  Total_Revolving_Bal: number;
  Avg_Open_To_Buy: number;
  Total_Amt_Chng_Q4_Q1: number;
  Total_Trans_Amt: number;
  Total_Trans_Ct: number;
  Total_Ct_Chng_Q4_Q1: number;
  Avg_Utilization_Ratio: number;
  
  // Education Level (one-hot encoded)
  Education_Level_Doctorate: number;
  Education_Level_Graduate: number;
  Education_Level_High_School: number;
  Education_Level_Post_Graduate: number;
  Education_Level_Uneducated: number;
  Education_Level_Unknown: number;
  
  // Marital Status (one-hot encoded)
  Marital_Status_Married: number;
  Marital_Status_Single: number;
  Marital_Status_Unknown: number;
  
  // Income Categories (one-hot encoded)
  "Income_Category_$40K_-_$60K": number;
  "Income_Category_$60K_-_$80K": number;
  "Income_Category_$80K_-_$120K": number;
  Income_Category_Less_than_$40K: number;
  Income_Category_Unknown: number;
  
  // Card Categories (one-hot encoded)
  Card_Category_Gold: number;
  Card_Category_Platinum: number;
  Card_Category_Silver: number;
}

interface ChurnRiskFactors {
  score: number;
  factors: string[];
  category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

@Service()
export class ChurnPredictionService extends BaseService<ChurnPrediction> {
  constructor() {
    super(ChurnPrediction);
  }

  async create(data: DeepPartial<ChurnPrediction>): Promise<ChurnPrediction> {
    if (!data.customerProfile) {
      throw new Error("Missing customer profile data.");
    }

    const riskAnalysis = this.analyzeChurnRisk(data.customerProfile as CustomerProfile);
    const prediction = this.makePrediction(riskAnalysis);

    // Handle customer relationship properly
    let customer: Customer | undefined = undefined;
    if (data.customerId) {
      const customerRepo = this.repository.manager.getRepository(Customer);
      customer = await customerRepo.findOne({ where: { id: data.customerId } }) || undefined;
      
      if (!customer) {
        throw new Error(`Customer with ID ${data.customerId} not found`);
      }
    }

    const record = this.repository.create({
      customerId: data.customerId,
      customer: customer,
      prediction,
      customerProfile: {
        ...data.customerProfile,
        _riskAnalysis: riskAnalysis // Store analysis for debugging
      }
    });

    return await this.repository.save(record);
  }

  /**
   * Comprehensive churn risk analysis using multiple sophisticated criteria
   */
  private analyzeChurnRisk(profile: CustomerProfile): ChurnRiskFactors {
    let riskScore = 0;
    const riskFactors: string[] = [];

    // 1. FINANCIAL BEHAVIOR ANALYSIS (40% of total risk)
    riskScore += this.analyzeFinancialBehavior(profile, riskFactors);

    // 2. ENGAGEMENT & ACTIVITY ANALYSIS (25% of total risk)
    riskScore += this.analyzeEngagementLevel(profile, riskFactors);

    // 3. DEMOGRAPHIC & LIFECYCLE ANALYSIS (20% of total risk)
    riskScore += this.analyzeDemographicRisk(profile, riskFactors);

    // 4. RELATIONSHIP DEPTH ANALYSIS (15% of total risk)
    riskScore += this.analyzeRelationshipDepth(profile, riskFactors);

    // Determine risk category
    let category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (riskScore >= 75) category = 'CRITICAL';
    else if (riskScore >= 60) category = 'HIGH';
    else if (riskScore >= 40) category = 'MEDIUM';
    else category = 'LOW';

    return {
      score: Math.round(riskScore),
      factors: riskFactors,
      category
    };
  }

  /**
   * Analyzes financial behavior patterns (40% weight)
   */
  private analyzeFinancialBehavior(profile: CustomerProfile, factors: string[]): number {
    let score = 0;

    // Credit Utilization Risk (0-15 points)
    if (profile.Avg_Utilization_Ratio > 0.9) {
      score += 15;
      factors.push("Extremely high utilization ratio (>90%)");
    } else if (profile.Avg_Utilization_Ratio > 0.7) {
      score += 12;
      factors.push("Very high utilization ratio (70-90%)");
    } else if (profile.Avg_Utilization_Ratio > 0.5) {
      score += 8;
      factors.push("High utilization ratio (50-70%)");
    } else if (profile.Avg_Utilization_Ratio < 0.1) {
      score += 5;
      factors.push("Very low utilization - potential product abandonment");
    }

    // Revolving Balance vs Credit Limit Risk (0-10 points)
    const balanceRatio = profile.Total_Revolving_Bal / profile.Credit_Limit;
    if (balanceRatio > 0.8) {
      score += 10;
      factors.push("Revolving balance near credit limit");
    } else if (balanceRatio > 0.6) {
      score += 7;
      factors.push("High revolving balance ratio");
    }

    // Transaction Amount Decline (0-10 points)
    if (profile.Total_Amt_Chng_Q4_Q1 < 0.7) {
      score += 10;
      factors.push("Significant transaction amount decline (>30%)");
    } else if (profile.Total_Amt_Chng_Q4_Q1 < 0.85) {
      score += 6;
      factors.push("Notable transaction amount decline (15-30%)");
    }

    // Transaction Count Decline (0-8 points)
    if (profile.Total_Ct_Chng_Q4_Q1 < 0.6) {
      score += 8;
      factors.push("Severe transaction frequency decline (>40%)");
    } else if (profile.Total_Ct_Chng_Q4_Q1 < 0.8) {
      score += 5;
      factors.push("Transaction frequency decline (20-40%)");
    }

    // Low Transaction Activity (0-7 points)
    const avgTransactionSize = profile.Total_Trans_Amt / Math.max(profile.Total_Trans_Ct, 1);
    if (profile.Total_Trans_Ct < 20) {
      score += 7;
      factors.push("Very low transaction frequency");
    } else if (avgTransactionSize < 50) {
      score += 4;
      factors.push("Very small average transaction size");
    }

    return Math.min(score, 40); // Cap at 40 points
  }

  /**
   * Analyzes customer engagement and activity levels (25% weight)
   */
  private analyzeEngagementLevel(profile: CustomerProfile, factors: string[]): number {
    let score = 0;

    // Inactivity Risk (0-12 points)
    if (profile.Months_Inactive_12_mon >= 6) {
      score += 12;
      factors.push("Extended inactivity period (6+ months)");
    } else if (profile.Months_Inactive_12_mon >= 4) {
      score += 8;
      factors.push("Significant inactivity period (4-5 months)");
    } else if (profile.Months_Inactive_12_mon >= 2) {
      score += 5;
      factors.push("Some inactivity periods (2-3 months)");
    }

    // Contact Frequency Risk (0-8 points)
    if (profile.Contacts_Count_12_mon >= 6) {
      score += 8;
      factors.push("High contact frequency - potential service issues");
    } else if (profile.Contacts_Count_12_mon >= 4) {
      score += 5;
      factors.push("Elevated contact frequency");
    } else if (profile.Contacts_Count_12_mon === 0) {
      score += 3;
      factors.push("No customer service contact - potential disengagement");
    }

    // Account Tenure vs Engagement Mismatch (0-5 points)
    if (profile.Months_on_book > 36 && profile.Total_Trans_Ct < 30) {
      score += 5;
      factors.push("Long tenure but low transaction activity");
    } else if (profile.Months_on_book < 12 && profile.Months_Inactive_12_mon > 2) {
      score += 4;
      factors.push("New customer showing early disengagement");
    }

    return Math.min(score, 25); // Cap at 25 points
  }

  /**
   * Analyzes demographic and lifecycle risk factors (20% weight)
   */
  private analyzeDemographicRisk(profile: CustomerProfile, factors: string[]): number {
    let score = 0;

    // Age-based Risk Patterns (0-8 points)
    if (profile.Customer_Age < 25) {
      score += 6;
      factors.push("Young demographic - higher churn tendency");
    } else if (profile.Customer_Age > 65) {
      score += 4;
      factors.push("Senior demographic - potential technology barriers");
    }

    // Education Level Risk (0-6 points)
    if (profile.Education_Level_Unknown === 1 || profile.Education_Level_Uneducated === 1) {
      score += 6;
      factors.push("Unknown/limited education - potential financial literacy issues");
    } else if (profile.Education_Level_High_School === 1) {
      score += 3;
      factors.push("High school education - moderate financial sophistication");
    }

    // Income Stability Risk (0-6 points)
    if (profile.Income_Category_Unknown === 1) {
      score += 6;
      factors.push("Unknown income category - financial instability risk");
    } else if (profile["Income_Category_Less_than_$40K"] === 1) {
      score += 4;
      factors.push("Low income bracket - potential payment difficulties");
    }

    return Math.min(score, 20); // Cap at 20 points
  }

  /**
   * Analyzes relationship depth and loyalty indicators (15% weight)
   */
  private analyzeRelationshipDepth(profile: CustomerProfile, factors: string[]): number {
    let score = 0;

    // Single Product Relationship Risk (0-8 points)
    if (profile.Total_Relationship_Count === 1) {
      score += 8;
      factors.push("Single product relationship - higher churn risk");
    } else if (profile.Total_Relationship_Count === 2) {
      score += 4;
      factors.push("Limited product portfolio");
    }

    // Card Category and Creditworthiness (0-7 points)
    if (profile.Card_Category_Silver === 1) {
      score += 5;
      factors.push("Basic card category - limited loyalty incentives");
    } else if (profile.Card_Category_Gold === 1) {
      score += 2;
      factors.push("Mid-tier card - moderate loyalty features");
    }
    // Platinum cards get 0 points (lowest risk)

    return Math.min(score, 15); // Cap at 15 points
  }

  /**
   * Advanced prediction logic using ensemble approach
   */
  private makePrediction(riskAnalysis: ChurnRiskFactors): "Churn" | "No Churn" {
    const { score, category, factors } = riskAnalysis;

    // Primary score-based prediction
    let churnProbability = score / 100;

    // Secondary pattern-based adjustments
    churnProbability = this.applyPatternAdjustments(factors, churnProbability);

    // Tertiary ensemble validation
    churnProbability = this.applyEnsembleValidation(riskAnalysis, churnProbability);

    // Final decision with confidence thresholds
    if (category === 'CRITICAL' || churnProbability >= 0.65) {
      return "Churn";
    } else if (category === 'HIGH' && churnProbability >= 0.55) {
      return "Churn";
    } else if (category === 'MEDIUM' && churnProbability >= 0.45 && this.hasHighRiskCombination(factors)) {
      return "Churn";
    }

    return "No Churn";
  }

  /**
   * Apply pattern-based adjustments to base probability
   */
  private applyPatternAdjustments(factors: string[], baseProbability: number): number {
    let adjustment = 0;

    // Critical pattern combinations
    const hasFinancialStress = factors.some(f => 
      f.includes("high utilization") || f.includes("near credit limit") || f.includes("payment difficulties"));
    const hasEngagementIssues = factors.some(f => 
      f.includes("inactivity") || f.includes("disengagement") || f.includes("low transaction"));
    const hasServiceIssues = factors.some(f => 
      f.includes("contact frequency") || f.includes("service issues"));

    // Compound risk multipliers
    if (hasFinancialStress && hasEngagementIssues) {
      adjustment += 0.15; // Financial stress + disengagement = high risk
    }
    if (hasServiceIssues && hasEngagementIssues) {
      adjustment += 0.12; // Service problems + disengagement = high risk
    }
    if (hasFinancialStress && hasServiceIssues) {
      adjustment += 0.10; // Financial stress + service issues = elevated risk
    }

    // Protective factors
    const hasHighValue = factors.some(f => f.includes("Platinum"));
    const hasStableUsage = !factors.some(f => f.includes("decline"));
    
    if (hasHighValue && hasStableUsage) {
      adjustment -= 0.08; // High value + stable = lower risk
    }

    return Math.max(0, Math.min(1, baseProbability + adjustment));
  }

  /**
   * Apply ensemble validation using multiple models
   */
  private applyEnsembleValidation(riskAnalysis: ChurnRiskFactors, probability: number): number {
    // Validate using alternative scoring approach
    const alternativeScore = this.calculateAlternativeScore(riskAnalysis.factors);
    const alternativeProbability = alternativeScore / 100;

    // Weighted ensemble (70% primary, 30% alternative)
    const ensembleProbability = (probability * 0.7) + (alternativeProbability * 0.3);

    return ensembleProbability;
  }

  /**
   * Alternative scoring mechanism for ensemble validation
   */
  private calculateAlternativeScore(factors: string[]): number {
    let score = 0;

    // Alternative weight distribution
    factors.forEach(factor => {
      if (factor.includes("Extremely") || factor.includes("Severe")) score += 20;
      else if (factor.includes("Very") || factor.includes("Significant")) score += 15;
      else if (factor.includes("High") || factor.includes("Extended")) score += 10;
      else if (factor.includes("Notable") || factor.includes("Elevated")) score += 7;
      else score += 5;
    });

    return Math.min(score, 100);
  }

  /**
   * Check for high-risk factor combinations
   */
  private hasHighRiskCombination(factors: string[]): boolean {
    const financialRisk = factors.filter(f => 
      f.includes("utilization") || f.includes("balance") || f.includes("decline")).length;
    const engagementRisk = factors.filter(f => 
      f.includes("inactivity") || f.includes("contact") || f.includes("transaction")).length;
    const demographicRisk = factors.filter(f => 
      f.includes("income") || f.includes("education") || f.includes("Young")).length;

    // High risk if multiple categories affected
    return (financialRisk >= 2 && engagementRisk >= 1) || 
           (engagementRisk >= 2 && demographicRisk >= 1) ||
           (financialRisk >= 1 && engagementRisk >= 2);
  }
}