import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany
} from "typeorm";
import { Bank } from "./Bank";
import { Branch } from "./Branch";
import { Appointment } from "./Appointment";
import { Feedback } from "./Feedback";

@Entity()
export class Employee {
  @PrimaryGeneratedColumn("uuid")
  EmployeeID!: string;

  @ManyToOne(() => Bank, (bank) => bank.Employees, { onDelete: "CASCADE" })
  Bank!: Bank;

  @ManyToOne(() => Branch, (branch) => branch.Employees, {
    onDelete: "CASCADE"
  })
  Branch!: Branch;

  @Column({ type: "varchar", length: 255 })
  FullName!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  RoleName!: string | null;

  @Column({ type: "varchar", length: 255, unique: true })
  Email!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  PhoneNumber!: string | null;

  @Column({ type: "integer", nullable: true })
  AssignedWindowID!: number | null;

  @Column({ type: "time", nullable: true })
  ShiftTime!: string | null;

  @OneToMany(() => Appointment, (appointment) => appointment.Employee)
  Appointments!: Appointment[];

  @OneToMany(() => Feedback, (feedback) => feedback.Employee)
  Feedbacks!: Feedback[];
}
