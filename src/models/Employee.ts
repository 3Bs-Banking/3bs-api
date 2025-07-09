import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { Bank } from "./Bank";
import { Branch } from "./Branch";
import { User } from "./User";
import { Appointment } from "./Appointment";
import { Feedback } from "./Feedback";

@Entity()
export class Employee {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Bank, (bank) => bank.employees, { onDelete: "CASCADE" })
  bank!: Bank;

  @ManyToOne(() => Branch, (branch) => branch.employees, {
    onDelete: "CASCADE"
  })
  branch!: Branch;

  // One-to-One relation with User (optional - for employees who have user accounts)
  @OneToOne(() => User, (user) => user.employee, { 
    nullable: true, 
    onDelete: "CASCADE" 
  })
  user?: User;

  @Column({ type: "varchar", length: 255 })
  fullName!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  roleName!: string | null;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 30, nullable: true })
  phoneNumber!: string | null;

  @Column({ type: "integer", nullable: true })
  assignedWindowID!: number | null;

  @Column({ type: "time", nullable: true })
  shiftTime!: string | null;

  @OneToMany(() => Appointment, (appointment) => appointment.employee)
  appointments!: Appointment[];

  @OneToMany(() => Feedback, (feedback) => feedback.employee)
  feedbacks!: Feedback[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}