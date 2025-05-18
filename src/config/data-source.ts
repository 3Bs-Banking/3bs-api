import "reflect-metadata";
import { DataSource } from "typeorm";
import { Bank } from "../models/Bank";
import { Branch } from "../models/Branch";
import { Service } from "../models/Service";
import { Customer } from "../models/Customer";
import { Employee } from "../models/Employee";
import { Window } from "../models/Window";
import { WindowToService } from "../models/WindowToService";
import { Appointment } from "../models/Appointment";
import { Feedback } from "../models/Feedback";
import { Setting } from "../models/Setting";
import { User } from "../models/User";
import { FraudPrediction } from "@/models/FraudPrediction";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { ChurnPrediction } from "@/models/ChurnPrediction";
import { Session } from "@/models/Session";

export const AppDataSource = new DataSource({
  type: "postgres",
  // url: process.env.DB_URL,
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: true,
  synchronize: true,
  logging: false,
  entities: [
    Bank,
    Branch,
    Service,
    Customer,
    Employee,
    Window,
    WindowToService,
    Appointment,
    Feedback,
    Setting,
    User,
    FraudPrediction,
    ChurnPrediction,
    Session,
    User
  ],
  migrations: [],
  subscribers: [],
  namingStrategy: new SnakeNamingStrategy()
});
