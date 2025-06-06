import "reflect-metadata";
import { FraudPredictionService } from "../services/FraudPredictionService";

async function runTest() {
  const service = new FraudPredictionService();

  // Mock the repository to avoid DB usage
  (service as any).repository = {
    create: (data: any) => data,
    save: async (data: any) => data // simulate saving
  };

  const result = await service.create({
    transaction: {
      merchant: "Test Store",
      category: "electronics",
      amt: 250,
      gender: "M",
      lat: 0,
      long: 0,
      city_pop: 1000000,
      job: "Developer",
      unix_time: 1690000000,
      merch_lat: 0,
      merch_long: 0,
      hour: 12,
      day: 10,
      month: 5,
      year: 2024,
      age: 30
    },
    bankId: "fake-bank-id"
  });

  console.log("✅ Test Result:", result);
}

runTest();
