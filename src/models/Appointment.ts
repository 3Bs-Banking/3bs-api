import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { Branch } from "./Branch";
import { Service } from "./Service";
import { Customer } from "./Customer";
import { Window } from "./Window";
import { Employee } from "./Employee";
import { Feedback } from "./Feedback";
import { Bank } from "./Bank";

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
  id!: string;

  @ManyToOne(() => Bank, (bank) => bank.appointments, {
    onDelete: "CASCADE"
  })
  bank!: Bank;

  @ManyToOne(() => Branch, (branch) => branch.appointments, {
    onDelete: "CASCADE"
  })
  branch!: Branch;

  @ManyToOne(() => Service, (service) => service.appointments, {
    onDelete: "CASCADE"
  })
  service!: Service;

  @ManyToOne(() => Customer, (customer) => customer.appointments, {
    onDelete: "CASCADE"
  })
  customer!: Customer;

  @ManyToOne(() => Window, (window) => window.appointments, {
    onDelete: "SET NULL"
  })
  window!: Window | null;

  @ManyToOne(() => Employee, (employee) => employee.appointments, {
    onDelete: "SET NULL"
  })
  employee!: Employee | null;

  @Column({ type: "timestamptz", nullable: true })
  appointmentScheduledTimestamp!: Date;

  @Column({ type: "timestamptz", nullable: true })
  appointmentArrivalTimestamp!: Date;

  @Column({ type: "date", nullable: true })
  appointmentStartDate!: Date | null;

  @Column({ type: "time", nullable: true })
  appointmentStartTime!: string | null;

  @Column({ type: "date", nullable: true })
  appointmentEndDate!: Date | null;

  @Column({ type: "time", nullable: true })
  appointmentEndTime!: string | null;

  @Column({
    type: "enum",
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING
  })
  status!: AppointmentStatus;

  @Column({
    type: "enum",
    enum: ReservationType
  })
  reservationType!: ReservationType;

  @ManyToOne(() => Feedback, (feedback) => feedback.appointment, {
    onDelete: "SET NULL"
  })
  feedback!: Feedback | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}