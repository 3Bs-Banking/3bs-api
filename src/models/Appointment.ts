import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Branch } from "./Branch";
import { Service } from "./Service";
import { Customer } from "./Customer";
import { Window } from "./Window";
import { Employee } from "./Employee";
import { Feedback } from "./Feedback";

export enum AppointmentStatus {
  PENDING = "Pending",
  COMPLETED = "Completed",
  CANCELED = "Canceled"
}

export enum ReservationType {
  ONLINE = "Online",
  OFFLINE = "Offline"
}

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn("uuid")
  AppointmentID!: string;

  @ManyToOne(() => Branch, (branch) => branch.Appointments, {
    onDelete: "CASCADE"
  })
  Branch!: Branch;

  @ManyToOne(() => Service, (service) => service.Appointments, {
    onDelete: "CASCADE"
  })
  Service!: Service;

  @ManyToOne(() => Customer, (customer) => customer.Appointments, {
    onDelete: "CASCADE"
  })
  Customer!: Customer;

  @ManyToOne(() => Window, (window) => window.Appointments, {
    onDelete: "CASCADE"
  })
  Window!: Window;

  @ManyToOne(() => Employee, (employee) => employee.Appointments, {
    onDelete: "SET NULL"
  })
  Employee!: Employee | null;

  @Column({ type: "date" })
  AppointmentStartDate!: Date;

  @Column({ type: "time" })
  AppointmentStartTime!: string;

  @Column({ type: "date", nullable: true })
  AppointmentEndDate!: Date | null;

  @Column({ type: "time", nullable: true })
  AppointmentEndTime!: string | null;

  @Column({
    type: "enum",
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING
  })
  Status!: AppointmentStatus;

  @Column({
    type: "enum",
    enum: ReservationType
  })
  ReservationType!: ReservationType;

  @ManyToOne(() => Feedback, (feedback) => feedback.Appointment, {
    onDelete: "SET NULL"
  })
  Feedback!: Feedback | null;
}
