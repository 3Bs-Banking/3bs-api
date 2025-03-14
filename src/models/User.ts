import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Bank } from "./Bank";
import { Branch } from "./Branch";

export enum UserRole {
  ADMIN = "Admin",
  MANAGER = "Manager"
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  UserID!: string;

  @ManyToOne(() => Bank, (bank) => bank.Users, { onDelete: "CASCADE" })
  Bank!: Bank;

  @ManyToOne(() => Branch, (branch) => branch.Users, { onDelete: "CASCADE" })
  Branch!: Branch;

  @Column({
    type: "enum",
    enum: UserRole
  })
  Role!: UserRole;
}
