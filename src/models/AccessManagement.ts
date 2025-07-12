// models/AccessManagement.ts
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
import { User } from "./User";
import bcrypt from "bcryptjs";

export enum AccessRole {
  ADMIN = "Admin",
  MANAGER = "Manager",
  EMPLOYEE = "Employee"
}

export enum AccessStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  ACTIVE = "Active",
  SUSPENDED = "Suspended"
}

export enum AccessType {
  NEW_USER = "New User",
  PROMOTION = "Promotion",
  ROLE_CHANGE = "Role Change"
}

@Entity()
export class AccessManagement {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { length: 20, unique: true })
  employeeId!: string;

  @Column("varchar", { length: 255, unique: true })
  email!: string;

  @Column("varchar", { length: 255 })
  fullName!: string;

  @Column("varchar", { length: 50 })
  firstName!: string;

  @Column("varchar", { length: 50 })
  lastName!: string;

  @Column("varchar", { length: 255 })
  password!: string;

  @Column({
    type: "enum",
    enum: AccessRole
  })
  role!: AccessRole;

  @Column({
    type: "enum",
    enum: AccessType
  })
  accessType!: AccessType;

  @Column({
    type: "enum",
    enum: AccessStatus,
    default: AccessStatus.PENDING
  })
  status!: AccessStatus;

  @ManyToOne(() => Bank, { onDelete: "CASCADE", eager: true })
  bank!: Bank;

  @ManyToOne(() => Branch, { onDelete: "CASCADE", eager: true })
  branch!: Branch;

  @ManyToOne(() => User, { nullable: true })
  createdBy!: User;

  @ManyToOne(() => User, { nullable: true })
  approvedBy!: User | null;

  @Column("varchar", { length: 20, nullable: true })
  existingEmployeeId!: string | null;

  @Column("varchar", { length: 20, nullable: true })
  previousRole!: string | null;

  @Column("varchar", { length: 500, nullable: true })
  notes!: string | null;

  @Column("timestamptz", { nullable: true })
  approvedAt!: Date | null;

  @Column("boolean", { default: true })
  isActive!: boolean;

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