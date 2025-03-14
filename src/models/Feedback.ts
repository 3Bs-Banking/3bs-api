import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Appointment } from "./Appointment";
import { Employee } from "./Employee";

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn("uuid")
  FeedbackID!: string;

  @ManyToOne(() => Appointment, (appointment) => appointment.Feedback, {
    onDelete: "CASCADE"
  })
  Appointment!: Appointment;

  @Column({ type: "integer" })
  SatisfactionRating!: number;

  @Column({ type: "integer" })
  TimeResolutionRating!: number;

  @Column({ type: "text", nullable: true })
  Comment!: string | null;

  @ManyToOne(() => Employee, (employee) => employee.Feedbacks, {
    onDelete: "SET NULL"
  })
  Employee!: Employee | null;
}
