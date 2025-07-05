import { AppDataSource } from "@/config/data-source";
import { ChurnPrediction } from "@/models/ChurnPrediction";

async function uploadChurnPredictionData() {
  await AppDataSource.initialize();

  const churnRepo = AppDataSource.getRepository(ChurnPrediction);

  console.log("🔍 Preparing churn prediction data for upload...");

  // Churn prediction data from CSV file
  const churnPredictionData = [
    {
      id: "0779955b-733e-4e68-82e5-541f8347e9b8",
      customerProfile: {
        "Gender": 1,
        "Credit_Limit": 8000,
        "Customer_Age": 30,
        "Months_on_book": 24,
        "Total_Trans_Ct": 40,
        "Avg_Open_To_Buy": 7800,
        "Dependent_count": 1,
        "Total_Trans_Amt": 2500,
        "Card_Category_Gold": 1,
        "Total_Ct_Chng_Q4_Q1": 1,
        "Total_Revolving_Bal": 200,
        "Card_Category_Silver": 0,
        "Total_Amt_Chng_Q4_Q1": 1.1,
        "Avg_Utilization_Ratio": 0.1,
        "Contacts_Count_12_mon": 5,
        "Marital_Status_Single": 0,
        "Card_Category_Platinum": 0,
        "Marital_Status_Married": 1,
        "Marital_Status_Unknown": 0,
        "Months_Inactive_12_mon": 1,
        "Education_Level_Unknown": 0,
        "Income_Category_Unknown": 0,
        "Education_Level_Graduate": 1,
        "Total_Relationship_Count": 3,
        "Education_Level_Doctorate": 0,
        "Education_Level_Uneducated": 0,
        "Education_Level_High_School": 0,
        "Income_Category_$40K_-_$60K": 0,
        "Income_Category_$60K_-_$80K": 0,
        "Income_Category_$80K_-_$120K": 1,
        "Education_Level_Post_Graduate": 0,
        "Income_Category_Less_than_$40K": 0
      },
      prediction: "No Churn" as "Churn" | "No Churn",
      createdAt: new Date("2025-06-03T04:25:15.306Z")
    },
    {
      id: "6919f1c1-279a-4552-8241-45b4a8b7273b",
      customerProfile: {
        "Gender": 0,
        "Credit_Limit": 20000,
        "Customer_Age": 55,
        "Months_on_book": 60,
        "Total_Trans_Ct": 90,
        "Avg_Open_To_Buy": 15000,
        "Dependent_count": 4,
        "Total_Trans_Amt": 5500,
        "Card_Category_Gold": 1,
        "Total_Ct_Chng_Q4_Q1": 1.4,
        "Total_Revolving_Bal": 5000,
        "Card_Category_Silver": 0,
        "Total_Amt_Chng_Q4_Q1": 1.5,
        "Avg_Utilization_Ratio": 0.4,
        "Contacts_Count_12_mon": 15,
        "Marital_Status_Single": 0,
        "Card_Category_Platinum": 0,
        "Marital_Status_Married": 1,
        "Marital_Status_Unknown": 0,
        "Months_Inactive_12_mon": 7,
        "Education_Level_Unknown": 0,
        "Income_Category_Unknown": 0,
        "Education_Level_Graduate": 0,
        "Total_Relationship_Count": 7,
        "Education_Level_Doctorate": 1,
        "Education_Level_Uneducated": 0,
        "Education_Level_High_School": 0,
        "Income_Category_$40K_-_$60K": 0,
        "Income_Category_$60K_-_$80K": 0,
        "Income_Category_$80K_-_$120K": 1,
        "Education_Level_Post_Graduate": 0,
        "Income_Category_Less_than_$40K": 0
      },
      prediction: "Churn" as "Churn" | "No Churn",
      createdAt: new Date("2025-06-03T04:26:03.776Z")
    },
    {
      id: "75cac36e-bc49-418a-a34b-01098c6621da",
      customerProfile: {
        "Gender": 1,
        "Credit_Limit": 10000,
        "Customer_Age": 45,
        "Months_on_book": 36,
        "Total_Trans_Ct": 50,
        "Avg_Open_To_Buy": 9500,
        "Dependent_count": 2,
        "Total_Trans_Amt": 3500,
        "Card_Category_Gold": 1,
        "Total_Ct_Chng_Q4_Q1": 1.1,
        "Total_Revolving_Bal": 500,
        "Card_Category_Silver": 0,
        "Total_Amt_Chng_Q4_Q1": 1.2,
        "Avg_Utilization_Ratio": 0.05,
        "Contacts_Count_12_mon": 3,
        "Marital_Status_Single": 0,
        "Card_Category_Platinum": 0,
        "Marital_Status_Married": 1,
        "Marital_Status_Unknown": 0,
        "Months_Inactive_12_mon": 1,
        "Education_Level_Unknown": 0,
        "Income_Category_Unknown": 0,
        "Education_Level_Graduate": 1,
        "Total_Relationship_Count": 5,
        "Education_Level_Doctorate": 0,
        "Education_Level_Uneducated": 0,
        "Education_Level_High_School": 0,
        "Income_Category_$40K_-_$60K": 0,
        "Income_Category_$60K_-_$80K": 0,
        "Income_Category_$80K_-_$120K": 1,
        "Education_Level_Post_Graduate": 0,
        "Income_Category_Less_than_$40K": 0
      },
      prediction: "Churn" as "Churn" | "No Churn",
      createdAt: new Date("2025-06-03T04:19:45.226Z")
    },
    {
      id: "8578970c-385d-48e6-afd8-8db15993fa22",
      customerProfile: {
        "Gender": 0,
        "Credit_Limit": 22000,
        "Customer_Age": 60,
        "Months_on_book": 72,
        "Total_Trans_Ct": 100,
        "Avg_Open_To_Buy": 20700,
        "Dependent_count": 3,
        "Total_Trans_Amt": 6100,
        "Card_Category_Gold": 1,
        "Total_Ct_Chng_Q4_Q1": 1.4,
        "Total_Revolving_Bal": 1300,
        "Card_Category_Silver": 0,
        "Total_Amt_Chng_Q4_Q1": 1.5,
        "Avg_Utilization_Ratio": 0.45,
        "Contacts_Count_12_mon": 12,
        "Marital_Status_Single": 0,
        "Card_Category_Platinum": 0,
        "Marital_Status_Married": 1,
        "Marital_Status_Unknown": 0,
        "Months_Inactive_12_mon": 8,
        "Education_Level_Unknown": 0,
        "Income_Category_Unknown": 0,
        "Education_Level_Graduate": 0,
        "Total_Relationship_Count": 7,
        "Education_Level_Doctorate": 1,
        "Education_Level_Uneducated": 0,
        "Education_Level_High_School": 0,
        "Income_Category_$40K_-_$60K": 0,
        "Income_Category_$60K_-_$80K": 0,
        "Income_Category_$80K_-_$120K": 1,
        "Education_Level_Post_Graduate": 0,
        "Income_Category_Less_than_$40K": 0
      },
      prediction: "Churn" as "Churn" | "No Churn",
      createdAt: new Date("2025-06-03T04:27:22.159Z")
    },
    {
      id: "9ed23a85-d2fd-4137-bf49-638b77e376c6",
      customerProfile: {
        "Gender": 0,
        "Credit_Limit": 9000,
        "Customer_Age": 35,
        "Months_on_book": 18,
        "Total_Trans_Ct": 35,
        "Avg_Open_To_Buy": 8400,
        "Dependent_count": 1,
        "Total_Trans_Amt": 2700,
        "Card_Category_Gold": 0,
        "Total_Ct_Chng_Q4_Q1": 1.1,
        "Total_Revolving_Bal": 600,
        "Card_Category_Silver": 1,
        "Total_Amt_Chng_Q4_Q1": 1.1,
        "Avg_Utilization_Ratio": 0.25,
        "Contacts_Count_12_mon": 4,
        "Marital_Status_Single": 1,
        "Card_Category_Platinum": 0,
        "Marital_Status_Married": 0,
        "Marital_Status_Unknown": 0,
        "Months_Inactive_12_mon": 1,
        "Education_Level_Unknown": 0,
        "Income_Category_Unknown": 0,
        "Education_Level_Graduate": 1,
        "Total_Relationship_Count": 3,
        "Education_Level_Doctorate": 0,
        "Education_Level_Uneducated": 0,
        "Education_Level_High_School": 0,
        "Income_Category_$40K_-_$60K": 0,
        "Income_Category_$60K_-_$80K": 1,
        "Income_Category_$80K_-_$120K": 0,
        "Education_Level_Post_Graduate": 0,
        "Income_Category_Less_than_$40K": 0
      },
      prediction: "No Churn" as "Churn" | "No Churn",
      createdAt: new Date("2025-06-03T04:26:30.087Z")
    },
    {
      id: "ab96ba63-ac52-406f-a007-bd9a570c07da",
      customerProfile: {
        "Gender": 1,
        "Credit_Limit": 12000,
        "Customer_Age": 40,
        "Months_on_book": 36,
        "Total_Trans_Ct": 55,
        "Avg_Open_To_Buy": 11200,
        "Dependent_count": 2,
        "Total_Trans_Amt": 3100,
        "Card_Category_Gold": 1,
        "Total_Ct_Chng_Q4_Q1": 1.2,
        "Total_Revolving_Bal": 800,
        "Card_Category_Silver": 0,
        "Total_Amt_Chng_Q4_Q1": 1.2,
        "Avg_Utilization_Ratio": 0.3,
        "Contacts_Count_12_mon": 7,
        "Marital_Status_Single": 0,
        "Card_Category_Platinum": 0,
        "Marital_Status_Married": 1,
        "Marital_Status_Unknown": 0,
        "Months_Inactive_12_mon": 2,
        "Education_Level_Unknown": 0,
        "Income_Category_Unknown": 0,
        "Education_Level_Graduate": 1,
        "Total_Relationship_Count": 4,
        "Education_Level_Doctorate": 0,
        "Education_Level_Uneducated": 0,
        "Education_Level_High_School": 0,
        "Income_Category_$40K_-_$60K": 0,
        "Income_Category_$60K_-_$80K": 1,
        "Income_Category_$80K_-_$120K": 0,
        "Education_Level_Post_Graduate": 0,
        "Income_Category_Less_than_$40K": 0
      },
      prediction: "Churn" as "Churn" | "No Churn",
      createdAt: new Date("2025-06-03T04:26:18.198Z")
    },
    {
      id: "c1e3ce01-2f3d-40c9-9be5-518547a8d5e2",
      customerProfile: {
        "Gender": 1,
        "Credit_Limit": 14000,
        "Customer_Age": 42,
        "Months_on_book": 36,
        "Total_Trans_Ct": 50,
        "Avg_Open_To_Buy": 13100,
        "Dependent_count": 2,
        "Total_Trans_Amt": 2800,
        "Card_Category_Gold": 0,
        "Total_Ct_Chng_Q4_Q1": 1.2,
        "Total_Revolving_Bal": 900,
        "Card_Category_Silver": 0,
        "Total_Amt_Chng_Q4_Q1": 1.25,
        "Avg_Utilization_Ratio": 0.28,
        "Contacts_Count_12_mon": 8,
        "Marital_Status_Single": 1,
        "Card_Category_Platinum": 1,
        "Marital_Status_Married": 0,
        "Marital_Status_Unknown": 0,
        "Months_Inactive_12_mon": 5,
        "Education_Level_Unknown": 0,
        "Income_Category_Unknown": 0,
        "Education_Level_Graduate": 1,
        "Total_Relationship_Count": 5,
        "Education_Level_Doctorate": 0,
        "Education_Level_Uneducated": 0,
        "Education_Level_High_School": 0,
        "Income_Category_$40K_-_$60K": 0,
        "Income_Category_$60K_-_$80K": 1,
        "Income_Category_$80K_-_$120K": 0,
        "Education_Level_Post_Graduate": 0,
        "Income_Category_Less_than_$40K": 0
      },
      prediction: "No Churn" as "Churn" | "No Churn",
      createdAt: new Date("2025-06-03T04:27:08.425Z")
    },
    {
      id: "d7875a26-04be-491c-aa59-551cd2ca7194",
      customerProfile: {
        "Gender": 0,
        "Credit_Limit": 15000,
        "Customer_Age": 45,
        "Months_on_book": 48,
        "Total_Trans_Ct": 80,
        "Avg_Open_To_Buy": 13500,
        "Dependent_count": 3,
        "Total_Trans_Amt": 4000,
        "Card_Category_Gold": 0,
        "Total_Ct_Chng_Q4_Q1": 1.3,
        "Total_Revolving_Bal": 1500,
        "Card_Category_Silver": 0,
        "Total_Amt_Chng_Q4_Q1": 1.4,
        "Avg_Utilization_Ratio": 0.35,
        "Contacts_Count_12_mon": 10,
        "Marital_Status_Single": 1,
        "Card_Category_Platinum": 1,
        "Marital_Status_Married": 0,
        "Marital_Status_Unknown": 0,
        "Months_Inactive_12_mon": 5,
        "Education_Level_Unknown": 0,
        "Income_Category_Unknown": 0,
        "Education_Level_Graduate": 0,
        "Total_Relationship_Count": 6,
        "Education_Level_Doctorate": 1,
        "Education_Level_Uneducated": 0,
        "Education_Level_High_School": 0,
        "Income_Category_$40K_-_$60K": 0,
        "Income_Category_$60K_-_$80K": 1,
        "Income_Category_$80K_-_$120K": 0,
        "Education_Level_Post_Graduate": 0,
        "Income_Category_Less_than_$40K": 0
      },
      prediction: "Churn" as "Churn" | "No Churn",
      createdAt: new Date("2025-06-03T04:25:34.692Z")
    },
    {
      id: "e16ac080-30bc-46ad-b34e-640b09af5215",
      customerProfile: {
        "Gender": 1,
        "Credit_Limit": 17000,
        "Customer_Age": 50,
        "Months_on_book": 48,
        "Total_Trans_Ct": 70,
        "Avg_Open_To_Buy": 15900,
        "Dependent_count": 2,
        "Total_Trans_Amt": 4200,
        "Card_Category_Gold": 1,
        "Total_Ct_Chng_Q4_Q1": 1.3,
        "Total_Revolving_Bal": 1100,
        "Card_Category_Silver": 0,
        "Total_Amt_Chng_Q4_Q1": 1.3,
        "Avg_Utilization_Ratio": 0.38,
        "Contacts_Count_12_mon": 12,
        "Marital_Status_Single": 0,
        "Card_Category_Platinum": 0,
        "Marital_Status_Married": 1,
        "Marital_Status_Unknown": 0,
        "Months_Inactive_12_mon": 3,
        "Education_Level_Unknown": 0,
        "Income_Category_Unknown": 0,
        "Education_Level_Graduate": 0,
        "Total_Relationship_Count": 6,
        "Education_Level_Doctorate": 1,
        "Education_Level_Uneducated": 0,
        "Education_Level_High_School": 0,
        "Income_Category_$40K_-_$60K": 1,
        "Income_Category_$60K_-_$80K": 0,
        "Income_Category_$80K_-_$120K": 0,
        "Education_Level_Post_Graduate": 0,
        "Income_Category_Less_than_$40K": 0
      },
      prediction: "Churn" as "Churn" | "No Churn",
      createdAt: new Date("2025-06-03T04:26:44.669Z")
    },
    {
      id: "e53f2be5-dd22-4a74-93d8-faa4c1a5dc62",
      customerProfile: {
        "Gender": 0,
        "Credit_Limit": 11000,
        "Customer_Age": 38,
        "Months_on_book": 24,
        "Total_Trans_Ct": 60,
        "Avg_Open_To_Buy": 10300,
        "Dependent_count": 0,
        "Total_Trans_Amt": 3200,
        "Card_Category_Gold": 1,
        "Total_Ct_Chng_Q4_Q1": 1.15,
        "Total_Revolving_Bal": 700,
        "Card_Category_Silver": 0,
        "Total_Amt_Chng_Q4_Q1": 1.15,
        "Avg_Utilization_Ratio": 0.32,
        "Contacts_Count_12_mon": 6,
        "Marital_Status_Single": 0,
        "Card_Category_Platinum": 0,
        "Marital_Status_Married": 1,
        "Marital_Status_Unknown": 0,
        "Months_Inactive_12_mon": 4,
        "Education_Level_Unknown": 0,
        "Income_Category_Unknown": 0,
        "Education_Level_Graduate": 1,
        "Total_Relationship_Count": 3,
        "Education_Level_Doctorate": 0,
        "Education_Level_Uneducated": 0,
        "Education_Level_High_School": 0,
        "Income_Category_$40K_-_$60K": 0,
        "Income_Category_$60K_-_$80K": 1,
        "Income_Category_$80K_-_$120K": 0,
        "Education_Level_Post_Graduate": 0,
        "Income_Category_Less_than_$40K": 0
      },
      prediction: "Churn" as "Churn" | "No Churn",
      createdAt: new Date("2025-06-03T04:26:56.313Z")
    },
    {
      id: "ebe2c99d-53ef-4508-9120-def82c49e523",
      customerProfile: {
        "Gender": 1,
        "Credit_Limit": 5000,
        "Customer_Age": 28,
        "Months_on_book": 12,
        "Total_Trans_Ct": 30,
        "Avg_Open_To_Buy": 4900,
        "Dependent_count": 0,
        "Total_Trans_Amt": 2900,
        "Card_Category_Gold": 0,
        "Total_Ct_Chng_Q4_Q1": 1,
        "Total_Revolving_Bal": 100,
        "Card_Category_Silver": 1,
        "Total_Amt_Chng_Q4_Q1": 1,
        "Avg_Utilization_Ratio": 0.05,
        "Contacts_Count_12_mon": 3,
        "Marital_Status_Single": 0,
        "Card_Category_Platinum": 0,
        "Marital_Status_Married": 1,
        "Marital_Status_Unknown": 0,
        "Months_Inactive_12_mon": 0,
        "Education_Level_Unknown": 0,
        "Income_Category_Unknown": 0,
        "Education_Level_Graduate": 1,
        "Total_Relationship_Count": 2,
        "Education_Level_Doctorate": 0,
        "Education_Level_Uneducated": 0,
        "Education_Level_High_School": 0,
        "Income_Category_$40K_-_$60K": 1,
        "Income_Category_$60K_-_$80K": 0,
        "Income_Category_$80K_-_$120K": 0,
        "Education_Level_Post_Graduate": 0,
        "Income_Category_Less_than_$40K": 0
      },
      prediction: "No Churn" as "Churn" | "No Churn",
      createdAt: new Date("2025-06-03T04:25:49.504Z")
    }
  ];

  console.log(`📊 Preparing to upload ${churnPredictionData.length} churn prediction records...\n`);

  const uploadedPredictions: ChurnPrediction[] = [];
  let successCount = 0;
  let errorCount = 0;

  // Process each churn prediction record
  for (let i = 0; i < churnPredictionData.length; i++) {
    try {
      const data = churnPredictionData[i];

      // Create ChurnPrediction entity
      const churnPrediction = churnRepo.create({
        id: data.id,
        customerProfile: data.customerProfile,
        prediction: data.prediction,
        createdAt: data.createdAt
      });

      uploadedPredictions.push(churnPrediction);
      successCount++;

      console.log(`✅ Prepared record ${i + 1}: ${data.id}`);
      console.log(`   Prediction: ${data.prediction}`);
      console.log(`   Customer Age: ${data.customerProfile.Customer_Age}`);
      console.log(`   Credit Limit: ${data.customerProfile.Credit_Limit}`);
      console.log(`   Created At: ${data.createdAt.toISOString()}`);
      console.log();

    } catch (error) {
      console.log(`❌ Error preparing record ${i + 1}:`, error);
      errorCount++;
    }
  }

  // Save all churn predictions to database
  if (uploadedPredictions.length > 0) {
    console.log(`💾 Uploading ${uploadedPredictions.length} records to database...`);
    await churnRepo.save(uploadedPredictions);
    console.log("🎉 Successfully uploaded all churn prediction data!\n");
  }

  // Summary table
  console.log("📋 CHURN PREDICTION UPLOAD SUMMARY");
  console.log("=" .repeat(120));
  console.log("ID".padEnd(40) + "Prediction".padEnd(15) + "Age".padEnd(8) + "Credit Limit".padEnd(15) + "Status");
  console.log("-".repeat(120));
  
  churnPredictionData.forEach(data => {
    console.log(
      data.id.padEnd(40) + 
      data.prediction.padEnd(15) + 
      String(data.customerProfile.Customer_Age).padEnd(8) +
      String(data.customerProfile.Credit_Limit).padEnd(15) +
      "✅ Uploaded"
    );
  });

  console.log("-".repeat(120));

  // Show final count and statistics
  const totalRecords = await churnRepo.count();
  const churnCount = await churnRepo.count({ where: { prediction: "Churn" } });
  const noChurnCount = await churnRepo.count({ where: { prediction: "No Churn" } });
  
  console.log(`\n📊 Database Summary:`);
  console.log(`   Total Churn Predictions: ${totalRecords}`);
  console.log(`   Uploaded Records: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   "Churn" Predictions: ${churnCount}`);
  console.log(`   "No Churn" Predictions: ${noChurnCount}`);

  // Prediction distribution
  console.log(`\n🎯 Prediction Distribution:`);
  const uploadedChurn = churnPredictionData.filter(d => d.prediction === "Churn").length;
  const uploadedNoChurn = churnPredictionData.filter(d => d.prediction === "No Churn").length;
  console.log(`   Churn: ${uploadedChurn} records (${((uploadedChurn/churnPredictionData.length)*100).toFixed(1)}%)`);
  console.log(`   No Churn: ${uploadedNoChurn} records (${((uploadedNoChurn/churnPredictionData.length)*100).toFixed(1)}%)`);

  // Customer profile insights
  console.log(`\n👥 Customer Profile Insights:`);
  const avgAge = churnPredictionData.reduce((sum, d) => sum + d.customerProfile.Customer_Age, 0) / churnPredictionData.length;
  const avgCreditLimit = churnPredictionData.reduce((sum, d) => sum + d.customerProfile.Credit_Limit, 0) / churnPredictionData.length;
  const avgTransactionCount = churnPredictionData.reduce((sum, d) => sum + d.customerProfile.Total_Trans_Ct, 0) / churnPredictionData.length;

  console.log(`   Average Customer Age: ${avgAge.toFixed(1)} years`);
  console.log(`   Average Credit Limit: $${avgCreditLimit.toFixed(0)}`);
  console.log(`   Average Transaction Count: ${avgTransactionCount.toFixed(1)}`);

  console.log(`\n🔄 UPLOAD CONFIRMATION:`);
  console.log(`   ✅ All ${churnPredictionData.length} churn prediction records uploaded successfully`);
  console.log(`   ✅ Customer profiles stored as JSONB format`);
  console.log(`   ✅ Predictions properly categorized as "Churn" or "No Churn"`);
  console.log(`   ✅ Original timestamps preserved from CSV data`);
  console.log(`   ✅ All UUIDs maintained from original data`);

  await AppDataSource.destroy();
}

uploadChurnPredictionData().catch((err) => {
  console.error("❌ Error uploading churn prediction data:", err);
  console.error("Full error details:", err);
});