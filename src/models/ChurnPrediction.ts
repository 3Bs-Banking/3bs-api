import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Customer } from "./Customer";

@Entity()
export class ChurnPrediction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Customer relation - many predictions can belong to one customer
  @ManyToOne(() => Customer, { eager: true })
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  @Column("uuid")
  customerId!: string;

  @Column("jsonb")
  customerProfile!: Record<string, any>;

  @Column("varchar", { length: 50 })
  prediction!: "Churn" | "No Churn";

  @CreateDateColumn()
  createdAt!: Date;
}
