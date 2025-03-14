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
  id!: string;

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
    onDelete: "CASCADE"
  })
  window!: Window;

  @ManyToOne(() => Employee, (employee) => employee.appointments, {
    onDelete: "SET NULL"
  })
  employee!: Employee | null;

  @Column({ type: "date" })
  appointmentStartDate!: Date;

  @Column({ type: "time" })
  appointmentStartTime!: string;

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
}
