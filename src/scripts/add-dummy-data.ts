import "@/config/env";
import "reflect-metadata";
import { AppDataSource as db } from "@/config/data-source";
import { faker } from "@faker-js/faker";
import moment from "moment";
import {
  Appointment,
  AppointmentStatus,
  ReservationType
} from "@/models/Appointment";
import { DeepPartial } from "typeorm";
import { Window } from "@/models/Window";
import { Feedback } from "@/models/Feedback";
import { Bank } from "@/models/Bank";
import { Branch } from "@/models/Branch";
import { Customer } from "@/models/Customer";
import { Service } from "@/models/Service";
import { Employee } from "@/models/Employee";
import Container from "typedi";
import { BankService } from "@/services/BankService";
import { BranchService } from "@/services/BranchService";
import { CustomerService } from "@/services/CustomerService";
import { EmployeeService } from "@/services/EmployeeService";
import { AppointmentService } from "@/services/AppointmentService";
import { FeedbackService } from "@/services/FeedbackService";
import { WindowService } from "@/services/WindowService";
import { ServiceService } from "@/services/Service";

const rand = (x: number) => Math.floor(Math.random() * x);

function generateRandomTimeSlot() {
  const startHour = Math.floor(Math.random() * (15 - 8 + 1)) + 8; // 8 to 15
  const startMinute = Math.floor(Math.random() * 60);

  const start = moment().startOf("day").hour(startHour).minute(startMinute);

  // Max 40 minutes duration
  const duration = Math.floor(Math.random() * 41); // 0 to 40 mins
  const end = moment(start).add(duration, "minutes");

  return {
    startTime: start.format("HH:mm"),
    endTime: end.format("HH:mm")
  };
}

function createRandomBank(): DeepPartial<Bank> {
  return {
    id: faker.string.uuid(),
    name: faker.company.name() + " Bank"
  };
}

function createRandomBranches(): DeepPartial<Branch> {
  const bank = banks[rand(banks.length)];

  return {
    id: faker.string.uuid(),
    bank: bank,
    name: faker.location.city() + " Branch",
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    zipCode: faker.location.zipCode(),
    contactNumber: faker.phone.number(),
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
    totalCustomerServiceWindows: rand(10),
    totalTellerWindows: rand(10)
  };
}

function createRandomCustomer(): DeepPartial<Customer> {
  const branch = branches[rand(branches.length)];

  return {
    id: faker.string.uuid(),
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    phoneNumber: faker.phone.number(),
    preferredBranch: branch,
    homeLatitude: faker.location.latitude(),
    homeLongitude: faker.location.longitude()
  };
}

function createRandomWindow(): DeepPartial<Window> {
  const branch = branches[rand(branches.length)];
  const windowsCount = windows.filter((w) => w.branch!.id === branch.id).length;

  return {
    id: faker.string.uuid(),
    bank: branch.bank,
    branch: branch,
    windowNumber: windowsCount + 1,
    category: ["Customer Service", "Teller"][rand(2)],
    currentAppointmentID: null
  };
}

function createRandomService(): DeepPartial<Service> {
  const bank = banks[rand(banks.length)];

  return {
    id: faker.string.uuid(),
    bank: bank,
    serviceCategory: faker.lorem.sentence({ min: 1, max: 2 }),
    serviceName: faker.lorem.sentence({ min: 3, max: 5 }),
    description: faker.lorem.text(),
    benchmarkTime: faker.number.int({ min: 10, max: 30 })
  };
}

function createRandomEmployee(): DeepPartial<Employee> {
  const branch = branches[rand(branches.length)];
  const windowsCount = windows.filter((w) => w.branch!.id === branch.id).length;

  return {
    id: faker.string.uuid(),
    bank: branch.bank,
    branch: branch,
    fullName: faker.person.fullName(),
    roleName: ["Customer Service", "Teller"][rand(2)],
    email: faker.internet.email(),
    phoneNumber: faker.phone.number(),
    assignedWindowID: rand(windowsCount) + 1,
    shiftTime: `${faker.number.int({ min: 7, max: 11 }).toString().padStart(2, "0")}:00:00`
  };
}

function createRandomAppointment(): DeepPartial<Appointment> {
  const service = services[rand(services.length)];
  const window = windows[rand(windows.length)];
  const customer = customers[rand(customers.length)];
  const employee = employees[rand(employees.length)];

  const { startTime, endTime } = generateRandomTimeSlot();
  const date = faker.date.anytime();

  return {
    id: faker.string.uuid(),
    bank: service.bank,
    branch: window.branch,
    service: service,
    customer: customer,
    window: window,
    employee: employee,
    appointmentStartDate: date,
    appointmentStartTime: startTime,
    appointmentEndDate: date,
    appointmentEndTime: endTime,
    status: [AppointmentStatus.COMPLETED, AppointmentStatus.PENDING][
      rand(2)
    ] as Appointment["status"],
    reservationType: [ReservationType.OFFLINE, ReservationType.ONLINE][
      rand(2)
    ] as Appointment["reservationType"]
  };
}

function createRandomFeedback(): DeepPartial<Feedback> {
  let appointment: DeepPartial<Appointment>;

  while (true) {
    appointment = appointments[rand(appointments.length)];
    if (!feedbacks.filter((f) => f.appointment!.id === appointment.id)[0])
      break;
  }

  return {
    id: faker.string.uuid(),
    appointment: appointment,
    satisfactionRating: faker.number.int({ min: 1, max: 5 }),
    timeResolutionRating: faker.number.int({ min: 1, max: 5 }),
    comment: faker.lorem.text(),
    employee: appointment.employee
  };
}

const banks = faker.helpers.multiple(createRandomBank, { count: 5 });
const branches = faker.helpers.multiple(createRandomBranches, { count: 10 });
const customers = faker.helpers.multiple(createRandomCustomer, { count: 150 });
let windows: DeepPartial<Window>[] = [];
windows = faker.helpers.multiple(createRandomWindow, { count: 600 });
const services = faker.helpers.multiple(createRandomService, { count: 50 });
const employees = faker.helpers.multiple(createRandomEmployee, { count: 100 });
const appointments = faker.helpers.multiple(createRandomAppointment, {
  count: 500
});
let feedbacks: DeepPartial<Feedback>[] = [];
feedbacks = faker.helpers.multiple(createRandomFeedback, { count: 100 });

async function generateData() {
  const bankService = Container.get(BankService);
  const branchService = Container.get(BranchService);
  const customerService = Container.get(CustomerService);
  const employeeService = Container.get(EmployeeService);
  const appointmentService = Container.get(AppointmentService);
  const feedbackService = Container.get(FeedbackService);
  const windowService = Container.get(WindowService);
  const serviceService = Container.get(ServiceService);

  try {
    console.log("Inserting banks");
    await bankService.createBatch(banks);

    // Insert Branches
    console.log("Inserting branches");
    await branchService.createBatch(branches);

    // Insert Customers
    console.log("Inserting customers");
    await customerService.createBatch(customers);

    // Insert Employees
    console.log("Inserting employees");
    await employeeService.createBatch(employees);

    // Insert Services
    console.log("Inserting services");
    await serviceService.createBatch(services);

    // Insert Windows
    console.log("Inserting windows");
    await windowService.createBatch(windows);

    // Insert Appointments
    console.log("Inserting appointments");
    await appointmentService.createBatch(appointments);

    // Insert Feedbacks
    console.log("Inserting feedbacks");
    await feedbackService.createBatch(feedbacks);

    console.log("All data has been successfully inserted.");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

async function start() {
  console.log("Initializing DB");
  await db.initialize();
  console.log(`Connected to DB: ${db.driver.database}`);
  Container.set("db", db);

  await generateData();
}

start();
