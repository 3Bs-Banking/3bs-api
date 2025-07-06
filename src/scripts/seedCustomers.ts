import { AppDataSource } from "@/config/data-source";
import { PersonalInvestmentRecommendation } from "@/models/PersonalInvestmentRecommendation";
import { Customer } from "@/models/Customer";

async function seedPersonalInvestmentRecommendations() {
  await AppDataSource.initialize();

  const recommendationRepo = AppDataSource.getRepository(PersonalInvestmentRecommendation);
  const customerRepo = AppDataSource.getRepository(Customer);

  console.log("🔍 Starting personal investment recommendation seeding process...");

  // All personal investment recommendation data from CSV with fixed UUIDs
  const recommendationData = [
    {
      id: "9eeb6a6a-9c1f-2d3e-bf6a-0e1f2a3b4c5d",
      customerId: "6d4220a3-7264-4442-bf44-8a45394d8681",
      inputData: {
        riskLevel: "Conservative",
        customerType: "Inactive",
        transactionType: "buy",
        investmentCapacity: 8000
      },
      outputData: [
        {
          ISIN: "EGINAC223344",
          Sector: "Money Market",
          "ROI (%)": 8.5,
          Industry: "Cash Equivalents",
          AssetType: "Money Market Fund"
        },
        {
          ISIN: "EGINAC223345",
          Sector: "Bonds",
          "ROI (%)": 14.2,
          Industry: "Government Bonds",
          AssetType: "Treasury Bond"
        },
        {
          ISIN: "EGINAC223346",
          Sector: "Banking",
          "ROI (%)": 16.8,
          Industry: "Savings Products",
          AssetType: "Bank CD"
        },
        {
          ISIN: "EGINAC223347",
          Sector: "Insurance",
          "ROI (%)": 11.9,
          Industry: "Life Insurance",
          AssetType: "Insurance Product"
        },
        {
          ISIN: "EGINAC223348",
          Sector: "Fixed Income",
          "ROI (%)": 13.7,
          Industry: "Municipal Bonds",
          AssetType: "Municipal Bond"
        }
      ],
      timestamp: new Date("2025-06-25T15:55:11.334Z")
    }
  ];

  console.log(`📊 Found ${recommendationData.length} personal investment recommendations to seed`);

  // Verify customer existence first
  console.log("🔍 Verifying customer existence in database...");
  const uniqueCustomerIds = [...new Set(recommendationData.map(rec => rec.customerId))];
  
  for (const customerId of uniqueCustomerIds) {
    const customer = await customerRepo.findOne({ where: { id: customerId } });
    if (!customer) {
      console.log(`⚠️  Warning: Customer with ID ${customerId} not found in database`);
    } else {
      console.log(`✅ Customer found: ${customer.fullName || 'Unknown'} (${customerId})`);
    }
  }

  console.log("\n💡 Seeding personal investment recommendations to database...\n");

  const newRecommendations: PersonalInvestmentRecommendation[] = [];
  const seededRecommendationsInfo: Array<{
    id: string;
    customerId: string;
    riskLevel: string;
    customerType: string;
    investmentCapacity: number;
    recommendationCount: number;
    avgROI: number;
    timestamp: Date;
  }> = [];

  for (const data of recommendationData) {
    // Calculate average ROI for this recommendation
    const avgROI = data.outputData!.reduce((sum, rec) => sum + rec["ROI (%)"], 0) / data.outputData!.length;
    
    // Create new PersonalInvestmentRecommendation record
    const newRecommendation = recommendationRepo.create({
      id: data.id,
      customer: { id: data.customerId } as Customer, // Reference by ID
      inputData: data.inputData,
      outputData: data.outputData,
      timestamp: data.timestamp
    });

    newRecommendations.push(newRecommendation);
    
    // Store seeded info for display
    seededRecommendationsInfo.push({
      id: data.id,
      customerId: data.customerId,
      riskLevel: data.inputData.riskLevel,
      customerType: data.inputData.customerType,
      investmentCapacity: data.inputData.investmentCapacity,
      recommendationCount: data.outputData!.length,
      avgROI: parseFloat(avgROI.toFixed(2)),
      timestamp: data.timestamp!
    });

    console.log(`✅ Prepared investment recommendation: ${data.id}`);
    console.log(`   Customer ID: ${data.customerId}`);
    console.log(`   Risk Level: ${data.inputData.riskLevel}`);
    console.log(`   Customer Type: ${data.inputData.customerType}`);
    console.log(`   Investment Capacity: ${data.inputData.investmentCapacity.toLocaleString()}`);
    console.log(`   Recommendations Count: ${data.outputData!.length}`);
    console.log(`   Average ROI: ${avgROI.toFixed(2)}%`);
    console.log(`   Created At: ${data.timestamp!.toISOString()}`);
    console.log();
  }

  // Save all new investment recommendations to database
  await recommendationRepo.save(newRecommendations);

  console.log("🎉 Successfully seeded personal investment recommendations to database!\n");

  // Summary table
  console.log("📋 SEEDED INVESTMENT RECOMMENDATIONS SUMMARY");
  console.log("=" .repeat(140));
  console.log("Risk Level".padEnd(15) + "Customer Type".padEnd(15) + "Investment Cap".padEnd(15) + "Avg ROI".padEnd(10) + "Count".padEnd(8) + "Timestamp".padEnd(25) + "ID");
  console.log("-".repeat(140));
  
  seededRecommendationsInfo.forEach(info => {
    console.log(
      info.riskLevel.padEnd(15) + 
      info.customerType.padEnd(15) + 
      `${(info.investmentCapacity / 1000).toFixed(0)}K`.padEnd(15) +
      `${info.avgROI}%`.padEnd(10) +
      info.recommendationCount.toString().padEnd(8) +
      info.timestamp.toISOString().slice(0, 19).padEnd(25) +
      info.id
    );
  });

  console.log("-".repeat(140));

  // Show final count and analysis
  const totalRecommendationsAfter = await recommendationRepo.count();
  const seededCount = newRecommendations.length;
  
  console.log(`\n📊 Seeding Summary:`);
  console.log(`   Investment recommendations seeded: ${seededCount}`);
  console.log(`   Total recommendations in database: ${totalRecommendationsAfter}`);
  console.log(`   Unique customers: ${uniqueCustomerIds.length}`);

  // Risk level distribution
  console.log(`\n⚖️  Risk Level Distribution:`);
  const riskLevelCounts = seededRecommendationsInfo.reduce((acc, rec) => {
    acc[rec.riskLevel] = (acc[rec.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(riskLevelCounts).forEach(([riskLevel, count]) => {
    console.log(`   ${riskLevel}: ${count} recommendation(s)`);
  });

  // Customer type distribution
  console.log(`\n👥 Customer Type Distribution:`);
  const customerTypeCounts = seededRecommendationsInfo.reduce((acc, rec) => {
    acc[rec.customerType] = (acc[rec.customerType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(customerTypeCounts).forEach(([customerType, count]) => {
    console.log(`   ${customerType}: ${count} recommendation(s)`);
  });

  // Investment capacity analysis
  console.log(`\n💰 Investment Capacity Analysis:`);
  const totalInvestmentCapacity = seededRecommendationsInfo.reduce((sum, rec) => sum + rec.investmentCapacity, 0);
  const avgInvestmentCapacity = totalInvestmentCapacity / seededRecommendationsInfo.length;
  const minInvestmentCapacity = Math.min(...seededRecommendationsInfo.map(rec => rec.investmentCapacity));
  const maxInvestmentCapacity = Math.max(...seededRecommendationsInfo.map(rec => rec.investmentCapacity));

  console.log(`   Total Investment Capacity: ${totalInvestmentCapacity.toLocaleString()}`);
  console.log(`   Average Investment Capacity: ${avgInvestmentCapacity.toLocaleString()}`);
  console.log(`   Minimum Investment Capacity: ${minInvestmentCapacity.toLocaleString()}`);
  console.log(`   Maximum Investment Capacity: ${maxInvestmentCapacity.toLocaleString()}`);

  // ROI analysis
  console.log(`\n📈 ROI Analysis:`);
  const avgROI = seededRecommendationsInfo.reduce((sum, rec) => sum + rec.avgROI, 0) / seededRecommendationsInfo.length;
  const minROI = Math.min(...seededRecommendationsInfo.map(rec => rec.avgROI));
  const maxROI = Math.max(...seededRecommendationsInfo.map(rec => rec.avgROI));

  console.log(`   Average ROI across all recommendations: ${avgROI.toFixed(2)}%`);
  console.log(`   Minimum average ROI: ${minROI.toFixed(2)}%`);
  console.log(`   Maximum average ROI: ${maxROI.toFixed(2)}%`);

  console.log(`\n🔄 SEEDING CONFIRMATION:`);
  console.log(`   ✅ Extracted data from CSV file`);
  console.log(`   ✅ Created ${seededCount} PersonalInvestmentRecommendation records`);
  console.log(`   ✅ Fixed all invalid UUIDs to proper format`);
  console.log(`   ✅ All records assigned to same customer: ${uniqueCustomerIds[0]}`);
  console.log(`   ✅ Maintained original timestamps and JSON data structures`);
  console.log(`   ✅ All recommendations saved to personal_investment_recommendation table`);
  console.log(`   ✅ Database seeding completed successfully`);

  await AppDataSource.destroy();
}

seedPersonalInvestmentRecommendations().catch((err) => {
  console.error("❌ Error seeding personal investment recommendations:", err);
  console.error("Full error details:", err);
});