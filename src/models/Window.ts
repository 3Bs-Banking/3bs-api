import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { Bank } from "./Bank";
import { Branch } from "./Branch";
import { WindowToService } from "./WindowToService";
import { Appointment } from "./Appointment";

@Entity()
export class Window {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Bank, (bank) => bank.windows, { onDelete: "CASCADE" })
  bank!: Bank;

  @ManyToOne(() => Branch, (branch) => branch.windows, { onDelete: "CASCADE" })
  branch!: Branch;

  @Column({ type: "integer" })
  windowNumber!: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  category!: string | null;

  @Column({ type: "integer", nullable: true })
  currentAppointmentID!: number | null;

  @OneToMany(() => WindowToService, (windowToService) => windowToService.window)
  windowServices!: WindowToService[];

  @OneToMany(() => Appointment, (appointment) => appointment.window)
  appointments!: Appointment[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
