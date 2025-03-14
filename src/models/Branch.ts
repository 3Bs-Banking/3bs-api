import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany
} from "typeorm";
import { Bank } from "./Bank";
import { Customer } from "./Customer";
import { Employee } from "./Employee";
import { Window } from "./Window";
import { Appointment } from "./Appointment";
import { User } from "./User";

@Entity()
export class Branch {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Bank, (bank) => bank.branches, { onDelete: "CASCADE" })
  bank!: Bank;

  @Column({ length: 255 })
  name!: string;

  @Column("varchar", { length: 255, nullable: true })
  address!: string | null;

  @Column("varchar", { length: 100, nullable: true })
  city!: string | null;

  @Column("varchar", { length: 100, nullable: true })
  state!: string | null;

  @Column("varchar", { length: 20, nullable: true })
  zipCode!: string | null;

  @Column("varchar", { length: 20, nullable: true })
  contactNumber!: string | null;

  @Column("float", { nullable: true })
  latitude!: number | null;

  @Column("float", { nullable: true })
  longitude!: number | null;

  @Column("int", { nullable: true })
  totalCustomerServiceWindows!: number | null;

  @Column("int", { nullable: true })
  totalTellerWindows!: number | null;

  @OneToMany(() => Customer, (customer) => customer.preferredBranch)
  customers!: Customer[];

  @OneToMany(() => Employee, (employee) => employee.branch)
  employees!: Employee[];

  @OneToMany(() => Window, (window) => window.branch)
  windows!: Window[];

  @OneToMany(() => Appointment, (appointment) => appointment.branch)
  appointments!: Appointment[];

  @OneToMany(() => User, (user) => user.branch)
  users!: User[];
}
