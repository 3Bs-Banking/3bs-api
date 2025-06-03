import "@/config/env";
import "reflect-metadata";
import { AppDataSource as db } from "@/config/data-source";
import { ForexPrediction } from "@/models/ForexPrediction";
import { DateTime } from "luxon";
import Container from "typedi";

async function verifyForexData() {
  console.log("🔍 Verifying Forex Data in Database\n");
  
  try {
    // Initialize database
    await db.initialize();
    Container.set("db", db);
    
    const forexRepo = db.getRepository(ForexPrediction);
    
    // Get all records ordered by currency and date
    const allRecords = await forexRepo.find({
      order: {
        currency: "ASC",
        createdAt: "DESC"
      }
    });
    
    if (allRecords.length === 0) {
      console.log("❌ No forex prediction records found in database");
      return;
    }
    
    console.log(`📊 Total records found: ${allRecords.length}\n`);
    
    // Group by currency
    const byCurrency = allRecords.reduce((acc, record) => {
      if (!acc[record.currency]) acc[record.currency] = [];
      acc[record.currency].push(record);
      return acc;
    }, {} as Record<string, ForexPrediction[]>);
    
    // Display data for each currency
    for (const [currency, records] of Object.entries(byCurrency)) {
      console.log(`\n💱 ${currency} - ${records.length} records`);
      console.log("━".repeat(60));
      
      // Show latest 5 records
      const recentRecords = records.slice(0, 5);
      
      recentRecords.forEach((record, index) => {
        const createdAt = DateTime.fromJSDate(record.createdAt).setZone("Africa/Cairo");
        const age = createdAt.toRelative();
        
        console.log(`\n${index === 0 ? '🔹 LATEST' : `${index + 1}.`} Created: ${createdAt.toFormat("yyyy-MM-dd HH:mm:ss")} (${age})`);
        console.log(`   ID: ${record.id}`);
        console.log(`   Open:  ${record.open.toFixed(4)}`);
        console.log(`   High:  ${record.high.toFixed(4)}`);
        console.log(`   Low:   ${record.low.toFixed(4)}`);
        console.log(`   Close: ${record.predictedClose?.toFixed(4) || 'N/A'}`);
        
        // Calculate and show spread
        const spread = record.high - record.low;
        console.log(`   Spread: ${spread.toFixed(4)} (${((spread / record.open) * 100).toFixed(2)}%)`);
      });
      
      if (records.length > 5) {
        console.log(`\n   ... and ${records.length - 5} more records`);
      }
    }
    
    // Show statistics
    console.log("\n\n📈 STATISTICS");
    console.log("━".repeat(60));
    
    for (const [currency, records] of Object.entries(byCurrency)) {
      const latest = records[0];
      const oneHourAgo = DateTime.now().minus({ hours: 1 });
      const isActive = DateTime.fromJSDate(latest.createdAt) > oneHourAgo;
      
      console.log(`\n${currency}:`);
      console.log(`  Status: ${isActive ? '🟢 Active (< 1 hour old)' : '🔴 Inactive (> 1 hour old)'}`);
      console.log(`  Latest update: ${DateTime.fromJSDate(latest.createdAt).toRelative()}`);
      console.log(`  Current predicted close: ${latest.predictedClose?.toFixed(4) || 'N/A'}`);
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

// Run the verification
verifyForexData();