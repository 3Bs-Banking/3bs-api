import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn
} from "typeorm";
import { Appointment } from "./Appointment";
import { Employee } from "./Employee";

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @OneToOne(() => Appointment, (appointment) => appointment.feedback, {
    onDelete: "CASCADE"
  })
  @JoinColumn()
  appointment!: Appointment;

  @Column({ type: "integer" })
  satisfactionRating!: number;

  @Column({ type: "integer" })
  timeResolutionRating!: number;

  @Column({ type: "text", nullable: true })
  comment!: string | null;

  @ManyToOne(() => Employee, (employee) => employee.feedbacks, {
    onDelete: "SET NULL"
  })
  employee!: Employee | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
