import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Bank } from "./Bank";
import { Branch } from "./Branch";

export enum UserRole {
  ADMIN = "Admin",
  MANAGER = "Manager"
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Bank, (bank) => bank.users, { onDelete: "CASCADE" })
  bank!: Bank;

  @ManyToOne(() => Branch, (branch) => branch.users, { onDelete: "CASCADE" })
  branch!: Branch;

  @Column({
    type: "enum",
    enum: UserRole
  })
  role!: UserRole;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
