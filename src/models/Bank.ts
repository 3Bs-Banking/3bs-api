import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Branch } from "./Branch";
import { Service } from "./Service";
import { Employee } from "./Employee";
import { Window } from "./Window";
import { Setting } from "./Setting";
import { User } from "./User";
import { FraudPrediction } from "./FraudPrediction";

@Entity()
export class Bank {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @OneToMany(() => Branch, (branch) => branch.bank)
  branches!: Branch[];

  @OneToMany(() => Service, (service) => service.bank)
  services!: Service[];

  @OneToMany(() => Employee, (employee) => employee.bank)
  employees!: Employee[];

  @OneToMany(() => Window, (window) => window.bank)
  windows!: Window[];

  @OneToMany(() => Setting, (setting) => setting.bank)
  settings!: Setting[];

  @OneToMany(() => User, (user) => user.bank)
  users!: User[];
  @OneToMany(() => FraudPrediction, (fp) => fp.bank)
  fraudPredictions!: FraudPrediction[];
}
