import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert
} from "typeorm";
import { Bank } from "./Bank";
import { Branch } from "./Branch";
import bcrypt from "bcryptjs";

export enum UserRole {
  ADMIN = "Admin",
  MANAGER = "Manager",
  CUSTOMER = "Customer"
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

  @Column("varchar", { length: 255 })
  fullName!: string;

  @Column("varchar", { length: 255, unique: true })
  email!: string;

  @Column("varchar", { length: 255 })
  password!: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
