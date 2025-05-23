import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { Branch } from "./Branch";
import { Appointment } from "./Appointment";

@Entity()
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  fullName!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 30, nullable: true })
  phoneNumber!: string | null;

  @ManyToOne(() => Branch, (branch) => branch.customers, {
    onDelete: "SET NULL"
  })
  preferredBranch!: Branch | null;

  @Column({ type: "float", nullable: true })
  homeLatitude!: number | null;

  @Column({ type: "float", nullable: true })
  homeLongitude!: number | null;

  @OneToMany(() => Appointment, (appointment) => appointment.customer)
  appointments!: Appointment[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
