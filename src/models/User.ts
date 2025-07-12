import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate
} from "typeorm";
import { Bank } from "./Bank";
import { Branch } from "./Branch";
import { Employee } from "./Employee";
import bcrypt from "bcryptjs";

export enum UserRole {
  ADMIN = "Admin",
  MANAGER = "Manager",
  CUSTOMER = "Customer",
  EMPLOYEE = "Employee"
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

  // One-to-One relation with Employee (optional - only for users with EMPLOYEE role)
  @OneToOne(() => Employee, (employee) => employee.user, { 
    nullable: true, 
    onDelete: "CASCADE" 
  })
  @JoinColumn()
  employee?: Employee;

  // Hash password before INSERT (for new users)
  @BeforeInsert()
  async hashPassword() {
    console.log("🔒 BeforeInsert: Hashing password for new user");
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
      console.log("✅ Password hashed successfully");
    }
  }

  // Hash password before UPDATE (for existing users)
  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    console.log("🔒 BeforeUpdate: Checking if password needs hashing");
    
    // Only hash if password exists and is not already hashed
    if (this.password && !this.password.startsWith('$2b$') && !this.password.startsWith('$2a$')) {
      console.log("🔄 Password is plain text, hashing now...");
      this.password = await bcrypt.hash(this.password, 10);
      console.log("✅ Password hashed successfully on update");
    } else if (this.password && (this.password.startsWith('$2b$') || this.password.startsWith('$2a$'))) {
      console.log("⏭️ Password already hashed, skipping");
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}