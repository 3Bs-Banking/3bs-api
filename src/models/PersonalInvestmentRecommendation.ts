import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Customer } from "@/models/Customer";

@Entity()
export class PersonalInvestmentRecommendation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Customer, { onDelete: "CASCADE" })
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  @Column({ type: "jsonb" })
  inputData!: Record<string, any>;

  @Column({ type: "jsonb" })
  outputData!: Record<string, any>[];

  @CreateDateColumn()
  timestamp!: Date;
}