import { AppDataSource } from "@/config/data-source";
import { Customer } from "@/models/Customer";
import { Service } from "@/models/Service";
import { Window } from "@/models/Window";
import { Employee } from "@/models/Employee";
import {
  Appointment,
  AppointmentStatus,
  ReservationType
} from "@/models/Appointment";

const BANK_ID = "e8bc09c4-487c-45cd-98da-abc27024a178";
const BRANCH_ID = "2e6e9c4a-b0e6-4fd9-80b8-0ccefc7eaefd";

const customerNames = [
  { first: "Youssef", last: "Fathy" },
  { first: "Nour", last: "Tawfik" },
  { first: "Hassan", last: "ElShenawy" }
];

const now = new Date();

function randomPhone() {
  const prefix = ["010", "011", "012", "015"][Math.floor(Math.random() * 4)];
  let number = "";
  while (number.length < 8) number += Math.floor(Math.random() * 10).toString();
  return prefix + number;
}

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Connected to DB");

    const customerRepo = AppDataSource.getRepository(Customer);
    const serviceRepo = AppDataSource.getRepository(Service);
    const windowRepo = AppDataSource.getRepository(Window);
    const employeeRepo = AppDataSource.getRepository(Employee);
    const appointmentRepo = AppDataSource.getRepository(Appointment);

    // 1. Create service
    const service = serviceRepo.create({
      bank: { id: BANK_ID },
      serviceCategory: "Customer Support",
      serviceName: "Card Issue Resolution",
      description: "Help customers resolve ATM or credit card issues",
      benchmarkTime: 15,
      createdAt: now,
      updatedAt: now
    });
    await serviceRepo.save(service);
    console.log("🛠️ Service created");

    // 2. Create window
    const window = windowRepo.create({
      bank: { id: BANK_ID },
      branch: { id: BRANCH_ID },
      windowNumber: 1,
      category: "General",
      createdAt: now,
      updatedAt: now
    });
    await windowRepo.save(window);
    console.log("🪟 Window created");

    // 3. Create employee assigned to window
    const employee = employeeRepo.create({
      fullName: "Ahmed Reda Helmy",
      email: "ahmed.helmy@bbb.emp.com",
      phoneNumber: randomPhone(),
      roleName: "Card Issue Resolution",
      assignedWindowID: 1,
      shiftTime: "09:00",
      bank: { id: BANK_ID },
      branch: { id: BRANCH_ID },
      createdAt: now,
      updatedAt: now
    });
    await employeeRepo.save(employee);
    console.log("👨‍💼 Employee created");

    // 4. Create customers
    const customers = [];
    for (const name of customerNames) {
      const customer = customerRepo.create({
        fullName: `${name.first} ${name.last}`,
        email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@gmail.com`,
        phoneNumber: randomPhone(),
        preferredBranch: { id: BRANCH_ID },
        homeLatitude: 31.2156 + Math.random() * 0.01,
        homeLongitude: 29.9553 + Math.random() * 0.01,
        questionnaireFilled: 0,
        createdAt: now,
        updatedAt: now
      });
      await customerRepo.save(customer);
      customers.push(customer);
      console.log(`👤 Customer created: ${customer.fullName}`);
    }

    // 5. Create appointments
    for (const customer of customers) {
      const appointment = appointmentRepo.create({
        bank: { id: BANK_ID },
        branch: { id: BRANCH_ID },
        service: { id: service.id },
        customer: { id: customer.id },
        window: { id: window.id },
        employee: { id: employee.id },
        appointmentScheduledTimestamp: now,
        appointmentStartDate: now,
        appointmentStartTime: "10:00",
        appointmentEndDate: now,
        appointmentEndTime: "10:15",
        status: AppointmentStatus.COMPLETED,
        reservationType: ReservationType.ONLINE,
        createdAt: now,
        updatedAt: now,
        feedback: null
      });
      await appointmentRepo.save(appointment);
      console.log(`📅 Appointment created for ${customer.fullName}`);
    }

    console.log(
      "\n🎉 All 3 customers, employee, service, window, and appointments created successfully."
    );
    await AppDataSource.destroy();
  } catch (err) {
    console.error("❌ Error:", err);
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
    process.exit(1);
  }
}

seed();
