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
import { WindowToService } from "./WindowToService";
import { Appointment } from "./Appointment";

@Entity()
export class Service {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Bank, (bank) => bank.services, { onDelete: "CASCADE" })
  bank!: Bank;

  @Column({
    type: "varchar",
    length: 255
  })
  serviceCategory!: string;

  @Column({
    type: "varchar",
    length: 255
  })
  serviceName!: string;

  @Column({
    type: "text",
    nullable: true
  })
  description!: string | null;

  @Column({
    type: "float",
    nullable: true
  })
  benchmarkTime!: number | null;

  @OneToMany(
    () => WindowToService,
    (windowToService) => windowToService.service
  )
  windowServices!: WindowToService[];

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments!: Appointment[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
